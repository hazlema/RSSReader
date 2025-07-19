# StoryCard Component

A comprehensive card component for displaying RSS feed stories with thumbnail support, action buttons, and responsive design.

---

## Overview

### Purpose
The StoryCard component displays individual news stories from RSS feeds in a visually appealing card format. It includes thumbnail images, metadata, action buttons for story management, and supports both light and dark themes.

### Key Features
- Automatic thumbnail fetching and caching
- Story visibility and publication status management
- Responsive design with mobile support
- Dark/light theme compatibility
- Accessibility-compliant interactions
- Feed logo fallback support

---

## API Reference

### Props/Parameters

| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `story` | `Story` | ✅ | - | Story object containing all story data |
| `onToggleVisibility` | `(uid: number, visible: boolean) => void` | ✅ | - | Callback for toggling story visibility |
| `onTogglePublished` | `(uid: number, published: boolean) => void` | ✅ | - | Callback for toggling published status |
| `isDarkMode` | `boolean` | ✅ | - | Theme mode for styling |
| `feedLogo` | `string` | ❌ | `undefined` | URL for feed logo fallback |

### TypeScript Interface
```typescript
interface StoryCardProps {
  story: {
    UID: number;
    title: string;
    link: string;
    last: string;
    visible: boolean;
    published: boolean;
    category_name?: string;
    feed_name?: string;
    feed_logo_url?: string;
  };
  onToggleVisibility: (uid: number, visible: boolean) => void;
  onTogglePublished: (uid: number, published: boolean) => void;
  isDarkMode: boolean;
  feedLogo?: string;
}
```

---

## Usage Examples

### Basic Usage
```tsx
import { StoryCard } from './components/StoryCard';

function StoryList() {
  const handleVisibilityToggle = (uid: number, visible: boolean) => {
    // Update story visibility
    console.log(`Story ${uid} visibility: ${visible}`);
  };

  const handlePublishedToggle = (uid: number, published: boolean) => {
    // Update story published status
    console.log(`Story ${uid} published: ${published}`);
  };

  return (
    <StoryCard
      story={{
        UID: 1,
        title: "Breaking News: Important Update",
        link: "https://example.com/article",
        last: "2025-01-16T20:30:00.000Z",
        visible: true,
        published: false,
        category_name: "Technology",
        feed_name: "Tech News"
      }}
      onToggleVisibility={handleVisibilityToggle}
      onTogglePublished={handlePublishedToggle}
      isDarkMode={false}
    />
  );
}
```

### With Feed Logo
```tsx
<StoryCard
  story={storyData}
  onToggleVisibility={handleVisibilityToggle}
  onTogglePublished={handlePublishedToggle}
  isDarkMode={true}
  feedLogo="https://example.com/feed-logo.png"
/>
```

### In a Story List
```tsx
function StoryList({ stories, isDarkMode }) {
  return (
    <div className="space-y-4">
      {stories.map((story) => (
        <StoryCard
          key={story.UID}
          story={story}
          onToggleVisibility={handleVisibilityToggle}
          onTogglePublished={handlePublishedToggle}
          isDarkMode={isDarkMode}
          feedLogo={story.feed_logo_url}
        />
      ))}
    </div>
  );
}
```

---

## Styling & Theming

### CSS Classes
- `.rounded-lg` - Card border radius
- `.shadow-sm` - Base shadow
- `.hover:shadow-md` - Hover shadow effect
- `.transition-all` - Smooth transitions

### Theme Support
- ✅ Dark mode compatible with `isDarkMode` prop
- ✅ Responsive design (mobile-first)
- ✅ Hover and focus states
- ✅ Custom color schemes via Tailwind

### Layout Structure
```
┌─────────────────────────────────────┐
│ Card Container                      │
│ ┌─────────┐ ┌─────────────────────┐ │
│ │Thumbnail│ │ Content Area        │ │
│ │ 96x96px │ │ - Date/Time/Tags    │ │
│ │         │ │ - Title             │ │
│ │         │ │ - Description       │ │
│ │         │ │ - Link              │ │
│ │         │ │ - Action Buttons    │ │
│ └─────────┘ └─────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Accessibility

### ARIA Support
- `role="article"` - Semantic article role
- `aria-label` - Descriptive labels for buttons
- `aria-describedby` - Links to story content

### Keyboard Navigation
- `Tab` - Navigate between action buttons
- `Enter/Space` - Activate buttons
- `Ctrl+Click` - Open link in new tab (native)

### Screen Reader Support
- ✅ Semantic HTML structure
- ✅ Descriptive button text
- ✅ Proper heading hierarchy
- ✅ Alternative text for images

### Color Contrast
- ✅ WCAG AA compliant text contrast
- ✅ High contrast mode support
- ✅ Focus indicators visible

---

## States & Variants

### Visual States
- **Default**: Normal card appearance
- **Hover**: Elevated shadow, subtle background change
- **Hidden**: Reduced opacity (50%) when `visible: false`
- **Loading**: Thumbnail loading animation

### Button States
- **Published**: Green background when `published: true`
- **Unpublished**: Gray background when `published: false`
- **Visible**: Eye icon when `visible: true`
- **Hidden**: Eye-off icon when `visible: false`

---

## Edge Cases & Error Handling

### Common Edge Cases
1. **Missing thumbnail**: Shows feed logo or placeholder icon
2. **Long titles**: Truncated with `line-clamp-2`
3. **Invalid image URLs**: Graceful fallback to placeholder
4. **Missing metadata**: Displays "Unknown Source" or "General"

### Error States
```tsx
// Thumbnail loading error
<StoryCard
  story={storyWithBrokenImage}
  onToggleVisibility={handleVisibility}
  onTogglePublished={handlePublished}
  isDarkMode={false}
  // Component handles broken images automatically
/>
```

### Network Failures
- Thumbnail fetch timeout (70 seconds)
- Automatic fallback to feed logo
- Cached results prevent duplicate requests

---

## Performance Considerations

### Optimization Features
- ✅ Thumbnail caching with Map-based cache
- ✅ Lazy image loading
- ✅ Debounced thumbnail fetching
- ✅ Memoized date formatting

### Bundle Size Impact
- Base component: ~3KB gzipped
- With thumbnail fetching: ~4KB gzipped
- Lucide icons: ~1KB per icon

### Memory Management
- Thumbnail cache prevents memory leaks
- AbortController for request cleanup
- Proper event listener cleanup

---

## Browser Support

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 90+ | ✅ Full | All features supported |
| Firefox | 88+ | ✅ Full | All features supported |
| Safari | 14+ | ✅ Full | All features supported |
| Edge | 90+ | ✅ Full | All features supported |

---

## Testing

### Unit Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { StoryCard } from './StoryCard';

const mockStory = {
  UID: 1,
  title: "Test Story",
  link: "https://example.com",
  last: "2025-01-16T20:30:00.000Z",
  visible: true,
  published: false,
  category_name: "Test Category",
  feed_name: "Test Feed"
};

test('renders story title and metadata', () => {
  render(
    <StoryCard
      story={mockStory}
      onToggleVisibility={jest.fn()}
      onTogglePublished={jest.fn()}
      isDarkMode={false}
    />
  );
  
  expect(screen.getByText('Test Story')).toBeInTheDocument();
  expect(screen.getByText('Test Category')).toBeInTheDocument();
  expect(screen.getByText('Test Feed')).toBeInTheDocument();
});

test('calls onToggleVisibility when hide button clicked', () => {
  const mockToggleVisibility = jest.fn();
  
  render(
    <StoryCard
      story={mockStory}
      onToggleVisibility={mockToggleVisibility}
      onTogglePublished={jest.fn()}
      isDarkMode={false}
    />
  );
  
  fireEvent.click(screen.getByText('Hide'));
  expect(mockToggleVisibility).toHaveBeenCalledWith(1, false);
});
```

### Integration Tests
```typescript
test('thumbnail fetching and caching', async () => {
  // Mock fetch for thumbnail endpoint
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ thumbnail: 'https://example.com/thumb.jpg' })
  });

  render(<StoryCard story={mockStory} {...defaultProps} />);
  
  // Wait for thumbnail to load
  await waitFor(() => {
    expect(screen.getByAltText('Test Story')).toBeInTheDocument();
  });
  
  // Verify fetch was called
  expect(fetch).toHaveBeenCalledWith('/api/thumbnail?url=https://example.com');
});
```

---

## Migration Guide

### From v1.x to v2.x
- `story.id` → `story.UID` (property name change)
- Added required `isDarkMode` prop
- `onHide`/`onShow` → `onToggleVisibility` (unified callback)

### Breaking Changes
- Removed `showThumbnail` prop (always shows thumbnail or fallback)
- Changed button styling to use Tailwind classes
- Updated TypeScript interfaces

---

## Related Components

- [Header](./Header.md) - Main application header
- [Sidebar](./Sidebar.md) - Category navigation
- [SettingsModal](./SettingsModal.md) - Story management settings

---

## Changelog

### v2.1.0
- Added thumbnail caching for improved performance
- Improved error handling for broken images
- Enhanced accessibility with better ARIA labels

### v2.0.0
- **BREAKING**: Updated story object interface
- Added dark mode support
- Improved responsive design
- Added TypeScript support

### v1.2.0
- Added feed logo fallback support
- Improved thumbnail loading states
- Enhanced button interactions

---

## Contributing

### Development Setup
```bash
npm install
npm run dev
```

### Adding New Features
1. Update TypeScript interfaces in `StoryCard.tsx`
2. Add tests for new functionality
3. Update this documentation
4. Test accessibility compliance
5. Verify thumbnail caching behavior

### Testing Thumbnail Functionality
```bash
# Test thumbnail endpoint
curl "http://localhost:3001/api/thumbnail?url=https://example.com"

# Test with various content types
curl "http://localhost:3001/api/thumbnail?url=https://example.com/image.jpg"
```

---

## Support

- 📧 Email: dev-team@rssreader.com
- 💬 Slack: #component-library
- 🐛 Issues: [GitHub Issues](https://github.com/rss-reader/issues)
- 📖 Docs: [Component Library](./README.md)