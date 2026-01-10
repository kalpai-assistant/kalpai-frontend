import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { isCognitoConfigured } from "./cognitoConfig";

interface AudioQueueItem {
  id: string;
  audioData: Uint8Array;
  text: string;
  sequence: number; // Ensure correct playback order
}

interface ChunkingState {
  phase: "first_sentence" | "rest";
  chunkCount: number;
  streamChunkCount: number; // Track incoming stream chunks
}

class PollyService {
  private client!: PollyClient;
  private textBuffer: string = "";
  private audioQueue: AudioQueueItem[] = [];
  private isPlaying: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private pendingSynthesis: Set<string> = new Set(); // Track concurrent API calls
  private chunkingState: ChunkingState = {
    phase: "first_sentence",
    chunkCount: 0,
    streamChunkCount: 0,
  };
  private isResponseEnded: boolean = false;
  private sequenceCounter: number = 0; // Track chunk order

  constructor() {
    // Cognito is initialized at app level, so we can initialize client immediately
    this.initializeClient();
  }

  // Initialize Polly client with Cognito credentials
  private async initializeClient(): Promise<void> {
    const region = process.env.REACT_APP_AWS_REGION || "us-east-1";

    if (isCognitoConfigured()) {
      try {
        // Use Cognito Identity Pool for credentials
        this.client = new PollyClient({
          region,
          credentials: fromCognitoIdentityPool({
            identityPoolId: process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID!,
            clientConfig: { region },
          }),
        });
        console.log("Polly initialized with Cognito credentials");
      } catch (error) {
        console.error("Failed to initialize with Cognito:", error);
        this.initializeFallbackClient(region);
      }
    } else {
      console.warn("Cognito not configured, using fallback credentials");
      this.initializeFallbackClient(region);
    }
  }

  // Fallback to environment credentials (for development)
  private initializeFallbackClient(region: string): void {
    this.client = new PollyClient({
      region,
      credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "",
      },
    });
  }

  // Count words in text
  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  // Find first complete sentence in buffer
  private extractFirstSentence(): {
    sentence: string;
    remaining: string;
  } | null {
    const match = this.textBuffer.match(/^(.*?[.!?]+)/);
    if (match) {
      const sentence = match[1].trim();
      const remaining = this.textBuffer.slice(match[0].length).trim();
      return { sentence, remaining };
    }
    return null;
  }

  // Extract first N stream chunks (fallback logic)
  private extractStreamChunks(count: number): {
    extracted: string;
    remaining: string;
  } {
    // This is approximate - we'll take first N words as fallback
    const words = this.textBuffer.trim().split(/\s+/);
    const extracted = words.slice(0, count).join(" ");
    const remaining = words.slice(count).join(" ");
    return { extracted, remaining };
  }

  // Smart sentence-based chunking logic
  private shouldProcessChunk(): { shouldProcess: boolean; chunkText: string } {
    if (!this.textBuffer.trim()) return { shouldProcess: false, chunkText: "" };

    switch (this.chunkingState.phase) {
      case "first_sentence":
        // Look for first sentence ending
        const firstSentence = this.extractFirstSentence();
        if (firstSentence) {
          return { shouldProcess: true, chunkText: firstSentence.sentence };
        }

        // Fallback: if we've received 6 stream chunks without finding sentence ending
        if (this.chunkingState.streamChunkCount >= 13) {
          const { extracted } = this.extractStreamChunks(13);
          return { shouldProcess: true, chunkText: extracted };
        }

        return { shouldProcess: false, chunkText: "" };

      case "rest":
        // For rest phase, send everything remaining when response ends
        if (this.isResponseEnded && this.textBuffer.trim()) {
          return { shouldProcess: true, chunkText: this.textBuffer.trim() };
        }
        return { shouldProcess: false, chunkText: "" };

      default:
        return { shouldProcess: false, chunkText: "" };
    }
  }

  // Remove processed text from buffer
  private removeFromBuffer(processedText: string): void {
    if (this.chunkingState.phase === "first_sentence") {
      // For sentence extraction, use the remaining text from extraction
      const extracted = this.extractFirstSentence();
      if (extracted && extracted.sentence === processedText.trim()) {
        this.textBuffer = extracted.remaining;
        return;
      }

      // Fallback to word-based removal for 6-chunk fallback
      const words = processedText.trim().split(/\s+/);
      const bufferWords = this.textBuffer.trim().split(/\s+/);
      this.textBuffer = bufferWords.slice(words.length).join(" ");
    } else {
      // For rest phase, clear entire buffer
      this.textBuffer = "";
    }
  }

  // Advance chunking state
  private advanceChunkingState(_processedText: string): void {
    this.chunkingState.chunkCount++;

    if (this.chunkingState.phase === "first_sentence") {
      // Move to rest phase after first sentence/chunk
      this.chunkingState.phase = "rest";
    }
  }

  // Reset chunking state
  private resetChunkingState(): void {
    this.chunkingState = {
      phase: "first_sentence",
      chunkCount: 0,
      streamChunkCount: 0,
    };
    this.isResponseEnded = false;
    this.sequenceCounter = 0;
  }

  // Async buffer update - adds text and processes based on sentence boundaries
  async addToBuffer(text: string): Promise<void> {
    this.textBuffer += text;

    // Track stream chunks for fallback logic
    if (this.chunkingState.phase === "first_sentence") {
      this.chunkingState.streamChunkCount++;
    }

    const { shouldProcess, chunkText } = this.shouldProcessChunk();
    if (shouldProcess) {
      await this.processChunk(chunkText);
    }
  }

  // Handle voice_response_end
  async handleVoiceResponseEnd(): Promise<void> {
    this.isResponseEnded = true;

    // Process any remaining buffer
    if (this.textBuffer.trim()) {
      await this.processChunk(this.textBuffer.trim());
    }

    // Reset state for next response
    this.resetChunkingState();
  }

  // Process specific chunk of text - ASYNC, NON-BLOCKING
  private async processChunk(chunkText: string): Promise<void> {
    if (!chunkText.trim()) return;

    const chunkId =
      Date.now().toString() + Math.random().toString(36).substring(2, 11);
    const sequence = this.sequenceCounter++; // Assign sequence number

    // Update chunking state immediately (sync)
    this.advanceChunkingState(chunkText);

    // Remove processed text from buffer immediately (sync)
    this.removeFromBuffer(chunkText);

    // Track this synthesis call
    this.pendingSynthesis.add(chunkId);

    // Fire-and-forget async synthesis (don't await!)
    this.synthesizeAsync(chunkText, chunkId, sequence);
  }

  // Async synthesis that doesn't block
  private async synthesizeAsync(
    chunkText: string,
    chunkId: string,
    sequence: number,
  ): Promise<void> {
    try {
      const audioData = await this.synthesizeSpeech(chunkText);
      const queueItem: AudioQueueItem = {
        id: chunkId,
        audioData,
        text: chunkText,
        sequence,
      };

      // Insert in queue maintaining sequence order
      this.insertIntoQueue(queueItem);
      this.playNext(); // Try to start playback
    } catch (error) {
      console.error("Polly synthesis error:", error);
    } finally {
      // Remove from pending set
      this.pendingSynthesis.delete(chunkId);
    }
  }

  // Insert audio item maintaining sequence order
  private insertIntoQueue(item: AudioQueueItem): void {
    // Find the correct position to maintain sequence order
    let insertIndex = this.audioQueue.length;
    for (let i = 0; i < this.audioQueue.length; i++) {
      if (this.audioQueue[i].sequence > item.sequence) {
        insertIndex = i;
        break;
      }
    }
    this.audioQueue.splice(insertIndex, 0, item);
  }

  // Force flush remaining buffer (for end of stream)
  async flushBuffer(): Promise<void> {
    await this.handleVoiceResponseEnd();
  }

  // AWS Polly synthesis
  private async synthesizeSpeech(text: string): Promise<Uint8Array> {
    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: "mp3",
      VoiceId: "Joanna", // Neural voice
      Engine: "standard",
      SampleRate: "22050",
    });

    const response = await this.client.send(command);
    return await response.AudioStream!.transformToByteArray();
  }

  // Optimized sync playback - minimal overhead
  private playNext(): void {
    if (this.isPlaying || this.audioQueue.length === 0) return;

    this.isPlaying = true;
    const queueItem = this.audioQueue.shift()!;

    // Create blob and audio with minimal overhead
    const blob = new Blob([queueItem.audioData], { type: "audio/mp3" });
    const audioUrl = URL.createObjectURL(blob);
    this.currentAudio = new Audio(audioUrl);

    // Optimize for minimal latency
    this.currentAudio.preload = "auto";
    this.currentAudio.volume = 0.9; // Slightly lower to avoid clipping

    // Try to load immediately
    this.currentAudio.load();

    // Streamlined event handlers
    this.currentAudio.onended = () => {
      this.cleanupAndPlayNext(audioUrl);
    };

    this.currentAudio.onerror = () => {
      console.error("Audio playback error for:", queueItem.text);
      this.cleanupAndPlayNext(audioUrl);
    };

    // Start playback immediately
    this.currentAudio.play().catch(() => {
      console.error("Audio play failed for:", queueItem.text);
      this.cleanupAndPlayNext(audioUrl);
    });
  }

  // Cleanup and continue to next audio
  private cleanupAndPlayNext(audioUrl: string): void {
    this.isPlaying = false;
    URL.revokeObjectURL(audioUrl);
    this.currentAudio = null;

    // Immediately try next audio (no delay)
    this.playNext();
  }

  // Complete text synthesis (for non-streaming)
  async speakComplete(text: string): Promise<void> {
    try {
      const audioData = await this.synthesizeSpeech(text);
      const queueItem: AudioQueueItem = {
        id: Date.now().toString(),
        audioData,
        text,
        sequence: this.sequenceCounter++,
      };

      this.insertIntoQueue(queueItem);
      this.playNext();
    } catch (error) {
      console.error("Polly synthesis error:", error);
      throw error;
    }
  }

  // Stop all audio and clear queues
  stop(): void {
    // Stop current audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      URL.revokeObjectURL(this.currentAudio.src);
      this.currentAudio = null;
    }

    // Clear queues and buffers
    this.audioQueue = [];
    this.textBuffer = "";
    this.isPlaying = false;
    this.pendingSynthesis.clear();
  }

  // Pause current audio
  pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  // Resume current audio
  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
  }

  // Get current state
  getState() {
    return {
      isPlaying: this.isPlaying,
      queueLength: this.audioQueue.length,
      bufferWordCount: this.countWords(this.textBuffer),
      pendingSynthesisCount: this.pendingSynthesis.size,
      chunkingState: { ...this.chunkingState },
      isResponseEnded: this.isResponseEnded,
    };
  }

  // Reset for new conversation/response
  resetForNewResponse(): void {
    this.stop();
    this.resetChunkingState();
  }
}

export const pollyService = new PollyService();
