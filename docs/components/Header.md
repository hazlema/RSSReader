# Header Component

A responsive application header with navigation controls, theme toggle, and connection status indicator.

---

## Overview

### Purpose
The Header component serves as the main navigation bar for the RSS Reader application. It displays the application branding, connection status, and provides access to key actions like refreshing feeds, toggling dark mode, and opening settings.

### Key Features
- Real-time connection status indicator
- Dark/light theme toggle
- Refresh feeds functionality
- Settings modal trigger
- Responsive design
- Accessibility-compliant navigation

---

## API Reference

### Props/Parameters

| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `onSettingsClick` | `() => void` | ✅ | - | Callback when settings button is clicked |
| `onRefreshClick` | `() => void` | ✅ | - | Callback when refresh button is clicked |
| `isConnected` | `boolean` | ✅ | - | WebSocket connection status |
| `isDarkMode` | `boolean` | ✅ | - | Current theme mode |
| `onToggleDarkMode` | `() => void` | ✅ | - | Callback for theme toggle |

### TypeScript Interface
```typescript
interface HeaderProps {
  onSettingsClick: () => void;
  onRefreshClick: () => void;
  isConnected: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}
```

---

## Usage Examples

### Basic Usage
```tsx
import { Header } from './components/Header';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  return (
    <Header
      onSettingsClick={() => setShowSettings(true)}
      onRefreshClick={() => refreshFeeds()}
      isConnected={isConnected}
      isDarkMode={isDarkMode}
      onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
    />
  );
}
```

### With State Management
```tsx
function App() {
  const { isConnected } = useWebSocket();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { refreshFeeds } = useFeedManager();

  return (
    <Header
      onSettingsClick={handleSettingsOpen}
      onRefreshClick={refreshFeeds}
      isConnected={isConnected}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
    />
  );
}
```

---

## Styling & Theming

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header Container (full width)                          │
│ ┌─────────────────┐           ┌─────────────────────┐   │
│ │ Logo + Title    │           │ Actions             │   │
│ │ • RSS Icon      │           │ • Theme Toggle      │   │
│ │ • "News Curator"│           │ • Refresh Button    │   │
│ │ • Status Text   │           │ • Settings Button   │   │
│ └─────────────────┘           └─────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Theme Support
- ✅ Dark mode with gray-800 background
- ✅ Light mode with white background
- ✅ Smooth color transitions
- ✅ Consistent border styling

### Responsive Behavior
- Mobile: Maintains horizontal layout
- Tablet/Desktop: Full spacing and padding
- Icons scale appropriately across devices

---

## Accessibility

### ARIA Support
- `role="banner"` - Header landmark role
- `aria-label` - Descriptive button labels
- Semantic HTML structure

### Keyboard Navigation
- `Tab` - Navigate between buttons
- `Enter/Space` - Activate buttons
- Focus indicators visible on all interactive elements

### Screen Reader Support
- ✅ Descriptive button text
- ✅ Status announcements
- ✅ Proper heading hierarchy

---

## States & Variants

### Connection States
- **Connected**: Green "Connected" status text
- **Disconnected**: Red "Disconnected" status text

### Theme States
- **Light Mode**: Sun icon, light backgrounds
- **Dark Mode**: Moon icon, dark backgrounds

### Button States
- **Default**: Normal appearance
- **Hover**: Background color change
- **Focus**: Ring outline for accessibility
- **Active**: Pressed state styling

---

## Edge Cases & Error Handling

### Common Edge Cases
1. **Connection loss**: Status updates automatically
2. **Rapid theme toggling**: Smooth transitions prevent flashing
3. **Button spam clicking**: Functions should be debounced in parent
4. **Long loading states**: Visual feedback for refresh operations

### Error Handling
```tsx
// Parent component should handle errors
<Header
  onRefreshClick={() => {
    try {
      refreshFeeds();
    } catch (error) {
      showErrorNotification('Failed to refresh feeds');
    }
  }}
  // ... other props
/>
```

---

## Performance Considerations

### Optimization Features
- ✅ Minimal re-renders with proper prop dependencies
- ✅ CSS transitions for smooth animations
- ✅ Efficient icon rendering with Lucide React

### Bundle Size
- Base component: ~1KB gzipped
- With Lucide icons: ~2KB gzipped

---

## Testing

### Unit Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

const defaultProps = {
  onSettingsClick: jest.fn(),
  onRefreshClick: jest.fn(),
  isConnected: true,
  isDarkMode: false,
  onToggleDarkMode: jest.fn()
};

test('displays connection status', () => {
  render(<Header {...defaultProps} isConnected={true} />);
  expect(screen.getByText('Connected')).toBeInTheDocument();
  
  render(<Header {...defaultProps} isConnected={false} />);
  expect(screen.getByText('Disconnected')).toBeInTheDocument();
});

test('calls callbacks when buttons clicked', () => {
  const mockSettings = jest.fn();
  const mockRefresh = jest.fn();
  const mockTheme = jest.fn();
  
  render(
    <Header
      {...defaultProps}
      onSettingsClick={mockSettings}
      onRefreshClick={mockRefresh}
      onToggleDarkMode={mockTheme}
    />
  );
  
  fireEvent.click(screen.getByText('Settings'));
  expect(mockSettings).toHaveBeenCalled();
  
  fireEvent.click(screen.getByText('Refresh'));
  expect(mockRefresh).toHaveBeenCalled();
  
  fireEvent.click(screen.getByRole('button', { name: /theme/i }));
  expect(mockTheme).toHaveBeenCalled();
});
```

---

## Related Components

- [Sidebar](./Sidebar.md) - Main navigation sidebar
- [SettingsModal](./SettingsModal.md) - Settings interface
- [App](../App.md) - Main application component

---

## Changelog

### v2.0.0
- Added dark mode toggle functionality
- Improved accessibility with ARIA labels
- Enhanced responsive design
- Added TypeScript support

### v1.1.0
- Added connection status indicator
- Improved button styling
- Added hover states

---

## Contributing

### Development Guidelines
1. Maintain consistent button styling
2. Ensure all interactive elements are keyboard accessible
3. Test with both light and dark themes
4. Verify responsive behavior on mobile devices

### Testing Checklist
- [ ] Connection status updates correctly
- [ ] Theme toggle works in both directions
- [ ] All buttons are keyboard accessible
- [ ] Responsive layout works on mobile
- [ ] ARIA labels are descriptive