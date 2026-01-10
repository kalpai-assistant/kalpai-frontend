export interface ChatIntroLineResponse {
  id: number;
  message: string;
  created_time: string;
  is_selected: boolean;
  ai_generated: boolean;
}

export interface ChatIntroLineRequest {
  message: string;
  intro_line_id?: number;
}

export interface ChatIntroImageResponse {
  id: number;
  business_id: number;
  file_id: number;
  is_selected: boolean;
  created_time: string;
  image_url: string;
  description?: string;
}
