# Component Documentation

This directory contains comprehensive documentation for all reusable components in the RSS Reader application.

## 📋 Documentation Standards

All component documentation follows our [Component Documentation Template](../component-documentation-template.md) and includes:

- **Purpose & Overview** - What the component does and when to use it
- **API Reference** - Props, TypeScript interfaces, and parameters
- **Usage Examples** - Basic and advanced implementation examples
- **Styling & Theming** - CSS classes, theme support, and customization
- **Accessibility** - ARIA support, keyboard navigation, and screen reader compatibility
- **States & Variants** - Visual states and component variations
- **Edge Cases** - Error handling and unusual scenarios
- **Performance** - Optimization features and bundle size impact
- **Testing** - Unit and integration test examples
- **Migration Guides** - Breaking changes and upgrade paths

## 🧩 Available Components

### Core Components
- [**StoryCard**](./StoryCard.md) - Displays RSS feed stories with thumbnails and actions
- [**Header**](./Header.md) - Application header with navigation and theme controls
- [**Sidebar**](./Sidebar.md) - Category navigation and countdown timer
- [**SettingsModal**](./SettingsModal.md) - Feed and category management interface

### Utility Components
- [**DateRangeFilter**](./DateRangeFilter.md) - Time-based story filtering
- [**VisibilityFilter**](./VisibilityFilter.md) - Show/hide story visibility controls
- [**DatabaseViewModal**](./DatabaseViewModal.md) - Database debugging interface

### Hooks
- [**useWebSocket**](../hooks/useWebSocket.md) - WebSocket connection management

## 🎨 Design System

### Theme Support
All components support both light and dark themes through the `isDarkMode` prop:

```tsx
// Light theme
<Component isDarkMode={false} />

// Dark theme  
<Component isDarkMode={true} />
```

### Color Palette
- **Primary**: Blue (blue-600, blue-700)
- **Secondary**: Gray (gray-100 to gray-900)
- **Success**: Green (green-600, green-700)
- **Warning**: Yellow (yellow-600, yellow-700)
- **Danger**: Red (red-600, red-700)

### Typography
- **Headings**: font-semibold, font-bold
- **Body**: Default font weight
- **Captions**: text-sm, text-gray-500/400

## ♿ Accessibility Standards

All components follow WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Management**: Visible focus indicators
- **Responsive Design**: Mobile-first approach

## 🧪 Testing Guidelines

### Unit Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from './Component';

test('component renders correctly', () => {
  render(<Component prop="value" />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Integration Testing
```typescript
test('component integrates with parent', async () => {
  const mockCallback = jest.fn();
  render(<Component onAction={mockCallback} />);
  
  await user.click(screen.getByRole('button'));
  expect(mockCallback).toHaveBeenCalled();
});
```

## 📦 Bundle Size Impact

| Component | Base Size | With Features | Notes |
|-----------|-----------|---------------|-------|
| StoryCard | ~3KB | ~4KB | Includes thumbnail fetching |
| Header | ~1KB | ~2KB | With Lucide icons |
| Sidebar | ~2KB | ~2KB | Minimal dependencies |
| SettingsModal | ~5KB | ~6KB | Complex form handling |

## 🔄 Component Lifecycle

### Development Process
1. **Design** - Create component design and API
2. **Implement** - Build component with TypeScript
3. **Test** - Write unit and integration tests
4. **Document** - Create comprehensive documentation
5. **Review** - Code review and accessibility audit
6. **Release** - Version and publish

### Maintenance
- Regular accessibility audits
- Performance monitoring
- Breaking change documentation
- Migration guide updates

## 🚀 Best Practices

### Component Design
- **Single Responsibility** - Each component has one clear purpose
- **Composition over Inheritance** - Use composition patterns
- **Props Interface** - Clear, typed prop interfaces
- **Default Props** - Sensible defaults for optional props

### Performance
- **React.memo** - Prevent unnecessary re-renders
- **Lazy Loading** - Load heavy components on demand
- **Bundle Splitting** - Separate component bundles
- **Tree Shaking** - Export only used functionality

### Accessibility
- **Semantic HTML** - Use appropriate HTML elements
- **ARIA Labels** - Descriptive labels for screen readers
- **Keyboard Support** - Full keyboard navigation
- **Focus Management** - Proper focus handling

## 📚 Resources

### External Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/)

### Accessibility Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

### Testing Resources
- [Testing Library](https://testing-library.com/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contributing

### Adding New Components
1. Follow the [Component Documentation Template](../component-documentation-template.md)
2. Include comprehensive TypeScript interfaces
3. Add unit and integration tests
4. Ensure accessibility compliance
5. Update this README with the new component

### Updating Existing Components
1. Update component documentation
2. Add migration notes for breaking changes
3. Update tests for new functionality
4. Verify accessibility compliance
5. Update changelog in component docs

---

For questions or contributions, please refer to our [Contributing Guidelines](../../CONTRIBUTING.md) or open an issue in the project repository.