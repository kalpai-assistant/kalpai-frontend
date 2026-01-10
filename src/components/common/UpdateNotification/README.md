# Update Notification System 🚀

A flexible, user-friendly update notification system that shows users the latest features without being intrusive.

## Features

- ✅ **Smart Dismissal** - Uses localStorage to remember dismissed updates
- ✅ **Automatic Latest** - Always shows the most recent unread update
- ✅ **Type-based Styling** - Different colors/icons for features, improvements, fixes
- ✅ **Priority Levels** - High priority updates get special "New!" badges
- ✅ **Navigation Integration** - Click to navigate directly to the updated feature
- ✅ **Smooth Animations** - Beautiful slide-in transitions
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Developer Friendly** - Easy to add new updates

## Quick Start

### 1. Add to Your Component

```tsx
import { UpdateNotification } from '../../../common/UpdateNotification';

const YourComponent = () => (
  <>
    <UpdateNotification 
      showOnPages={["/"]} // Optional: only show on homepage
      position="top" 
      autoHideAfter={0} // 0 = never auto-hide
    />
    {/* Your other content */}
  </>
);
```

### 2. Add New Updates

Edit `UpdateNotification.tsx` and add to the `UPDATES` array:

```tsx
{
  id: "update-2025-09-20-new-feature", // Must be unique
  type: "feature", // feature | improvement | fix | announcement
  title: "🎉 Amazing New Feature!",
  description: "Check out this incredible new functionality that will boost your productivity!",
  path: "/new-feature", // Where to navigate when clicked
  priority: "high", // low | medium | high
  date: "Sep 20, 2025" // Optional display date
}
```

## Update Types

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| `feature` | Blue | ✨ Sparkles | New functionality |
| `improvement` | Green | ➡️ Arrow | Enhanced existing features |
| `fix` | Orange | ℹ️ Info | Bug fixes, stability |
| `announcement` | Purple | ℹ️ Info | General announcements |

## Priority Levels

- **High**: Shows "New!" badge, gets attention
- **Medium**: Standard styling
- **Low**: Subtle appearance

## Props

### UpdateNotification

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showOnPages` | `string[]` | `undefined` | Only show on specific pages (paths) |
| `position` | `"top" \| "bottom"` | `"top"` | Where to position the notification |
| `autoHideAfter` | `number` | `0` | Auto-hide after X seconds (0 = never) |

## Advanced Usage

### Multiple Page Targeting

```tsx
<UpdateNotification 
  showOnPages={["/", "/dashboard", "/analytics"]} 
/>
```

### Auto-hide After 10 Seconds

```tsx
<UpdateNotification 
  autoHideAfter={10}
/>
```

### Bottom Positioning

```tsx
<UpdateNotification 
  position="bottom"
/>
```

## Update Management

### Programmatic Control

```tsx
import { UpdateManager } from '../../../common/UpdateNotification/updateManager';

// Check if user has seen an update
const hasSeen = UpdateManager.isUpdateDismissed('update-2025-09-20-feature');

// Mark update as dismissed
UpdateManager.dismissUpdate('update-2025-09-20-feature');

// Clear all dismissed (for testing)
UpdateManager.clearAllDismissed();

// Get engagement stats
const stats = UpdateManager.getEngagementStats();
```

### Development Debugging

In development mode, `UpdateManager` is available at `window.UpdateManager`:

```javascript
// Clear all dismissed updates for testing
window.UpdateManager.clearAllDismissed();

// Check what's been dismissed
console.log(window.UpdateManager.getDismissedUpdates());
```

## Best Practices

### Writing Good Updates

✅ **DO:**
- Use emojis in titles for visual appeal
- Write clear, benefit-focused descriptions
- Include the date for context
- Set appropriate priority levels
- Use specific, unique IDs

❌ **DON'T:**
- Write vague descriptions
- Use generic IDs that might conflict
- Overuse high priority (users get notification fatigue)
- Make descriptions too long

### ID Naming Convention

Use this format: `update-YYYY-MM-DD-feature-name`

Examples:
- `update-2025-09-20-telegram-integration`
- `update-2025-09-21-dashboard-redesign`
- `update-2025-09-22-performance-improvements`

### Update Lifecycle

1. **Add** - Add new update to the UPDATES array
2. **Deploy** - Users see the notification on next visit
3. **Engage** - Users click "Explore Now" or dismiss
4. **Track** - System remembers user's choice
5. **Archive** - Old updates remain in code but won't show

## Styling

### Custom Styles

Override in your CSS:

```scss
.updateNotification {
  // Custom positioning
  right: 10px !important;
  
  // Custom max width
  max-width: 350px !important;
}
```

### Theme Integration

The component uses Mantine's theme colors automatically:
- `var(--mantine-color-blue-6)` for features
- `var(--mantine-color-green-6)` for improvements
- etc.

## Examples

### New Feature Announcement

```tsx
{
  id: "update-2025-10-01-ai-assistant",
  type: "feature",
  title: "🤖 AI Assistant 2.0",
  description: "Our upgraded AI assistant now understands context better and provides more accurate responses!",
  path: "/talk",
  priority: "high",
  date: "Oct 1, 2025"
}
```

### Bug Fix Notification

```tsx
{
  id: "update-2025-10-02-performance-fix",
  type: "fix", 
  title: "⚡ Faster Load Times",
  description: "We've optimized the dashboard loading speed by 60%. Enjoy the snappier experience!",
  path: "/",
  priority: "medium",
  date: "Oct 2, 2025"
}
```

### UI Improvement

```tsx
{
  id: "update-2025-10-03-mobile-ui",
  type: "improvement",
  title: "📱 Better Mobile Experience", 
  description: "The mobile interface has been redesigned for easier navigation and better usability.",
  path: "/",
  priority: "low",
  date: "Oct 3, 2025"
}
```

## Troubleshooting

### Update Not Showing

1. Check if it's already been dismissed
2. Verify the `showOnPages` prop matches current path
3. Ensure the update ID is unique
4. Check browser localStorage for dismissed updates

### Clear Dismissed Updates

```javascript
// In browser console
localStorage.removeItem('kalp-ai-dismissed-updates');
```

### Testing New Updates

1. Add your update to the UPDATES array
2. Clear dismissed updates: `window.UpdateManager.clearAllDismissed()`
3. Refresh the page
4. Your update should appear

## Contributing

When adding new updates:

1. Follow the ID naming convention
2. Test on different screen sizes
3. Verify navigation works correctly
4. Use appropriate type and priority
5. Keep descriptions concise but informative

---

Happy updating! 🎉
