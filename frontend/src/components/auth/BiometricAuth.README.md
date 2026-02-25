# BiometricAuth Component - Quick Reference

## Usage

```tsx
import { BiometricAuth } from './components/auth/BiometricAuth';

function MyComponent() {
  const handleAuthComplete = (success: boolean, data: any) => {
    if (success) {
      console.log('Authentication successful!', data);
      // Proceed with voting or other actions
    }
  };

  return (
    <BiometricAuth
      onAuthComplete={handleAuthComplete}
      requiredMethods={['fingerprint', 'face', 'voice']}
      onClose={() => console.log('User cancelled')}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onAuthComplete` | `(success: boolean, data: any) => void` | Yes | - | Callback when authentication completes |
| `requiredMethods` | `Array<'fingerprint' \| 'face' \| 'voice'>` | No | `['fingerprint']` | Authentication methods to use |
| `onClose` | `() => void` | No | - | Callback when user closes/cancels |

## Features Included

### 1. Error Handling
- Detailed error messages with recovery steps
- Retry mechanism with attempt counter
- Context-specific guidance for each error type

### 2. Loading States
- Skeleton loaders during initial load
- Progress bars with percentage
- Smooth transitions between states

### 3. Accessibility
- Full ARIA label support
- Keyboard navigation (Enter, Space, Tab)
- Screen reader announcements
- Focus management

### 4. Progress Indicators
- Step-by-step visual progress
- Individual step status indicators
- Percentage completion display
- Color-coded states

### 5. Retry Mechanism
- One-click retry button
- Retry attempt counter
- Maintains authentication context
- Separate cancel option

### 6. Offline Support
- Network status detection
- Offline indicator badge
- Service worker caching
- Automatic reconnection

### 7. Dark Mode
- Auto-detection from system
- Manual toggle button
- Smooth theme transitions
- Consistent color scheme

### 8. Animations
- Entry animations (slideIn, fadeIn)
- Interactive micro-interactions
- Loading shimmer effects
- Success celebration animation

### 9. Mobile Optimization
- Touch-optimized button sizes (min 44x44px)
- Responsive typography and spacing
- Touch-friendly interactions
- Better thumb reach zones

### 10. Performance
- GPU-accelerated animations
- Lazy loading patterns
- Optimized re-renders
- Service worker asset caching

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Activate focused button |
| `Space` | Activate focused button |
| `Tab` | Navigate to next element |
| `Shift + Tab` | Navigate to previous element |

## States

### Loading
- Shows spinner with progress bar
- Displays loading percentage (0-100%)
- Shows "Authenticating..." message

### Error
- Red error box with icon
- Error title and description
- Numbered recovery steps
- Retry and cancel buttons

### Success
- Green checkmark with celebration animation
- Success message
- List of completed methods
- Auto-proceeds or shows completion

### Offline
- Yellow offline indicator
- "You are offline" message
- Disabled authentication button
- Auto-enables when back online

## Customization

### Colors (Tailwind Classes)
```css
Primary: orange-500 to green-600 (gradient)
Error: red-600 / red-50 background
Warning: yellow-600 / yellow-50 background
Success: green-600 / green-50 background
Info: blue-600 / blue-50 background
```

### Dark Mode Classes
```css
Background: dark:bg-gray-900/95
Text: dark:text-gray-100
Borders: dark:border-orange-800
Secondary BG: dark:bg-gray-700
```

### Animation Timing
- Entry: 0.3s
- Fade: 0.5s
- Transitions: 0.3s
- Progress: 0.5s

## Error Types

### Device Authentication Failed
**Recovery Steps:**
1. Check your internet connection
2. Clear browser cache and cookies
3. Try using a different browser
4. Contact support if issue persists

### Fingerprint Authentication Failed
**Recovery Steps:**
1. Clean your finger and the sensor
2. Try using a different finger
3. Ensure your finger covers the entire sensor
4. Check device biometric settings

### Face Recognition Failed
**Recovery Steps:**
1. Ensure good lighting on your face
2. Remove glasses, hats, or masks
3. Look directly at the camera
4. Move to a well-lit area
5. Clean your camera lens

### Voice Recognition Failed
**Recovery Steps:**
1. Speak clearly and at normal volume
2. Reduce background noise
3. Check microphone permissions
4. Ensure microphone is not muted
5. Try a quieter environment

### No Internet Connection
**Recovery Steps:**
1. Check if WiFi or mobile data is enabled
2. Try moving to an area with better signal
3. Restart your router if using WiFi

## Testing

### Manual Testing
```bash
# Test different states
1. Normal flow: All methods pass
2. Error flow: Simulate failures
3. Retry flow: Retry after errors
4. Offline flow: Disable network
5. Dark mode: Toggle and test
```

### Accessibility Testing
```bash
# Use screen reader (NVDA, JAWS, VoiceOver)
1. Navigate with Tab key only
2. Listen to announcements
3. Check focus indicators
4. Verify ARIA labels

# Use Lighthouse
1. Run accessibility audit
2. Check score (aim for 95+)
3. Fix reported issues
```

### Mobile Testing
```bash
# Test on actual devices
1. Touch target sizes
2. Responsive layout
3. Touch gestures
4. Performance
```

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Safari | iOS 14+ | ✅ Full |
| Chrome Mobile | Latest | ✅ Full |

## Known Issues

1. **Simulated Authentication**: Currently uses simulated biometric auth. Replace with real WebAuthn API for production.

2. **Dark Mode Persistence**: Dark mode toggle doesn't persist across sessions. Add localStorage to persist.

3. **Service Worker HTTPS**: Service worker requires HTTPS in production. Works on localhost for development.

## Future Enhancements

- [ ] Real biometric integration (WebAuthn)
- [ ] Persistent dark mode preference
- [ ] Multi-language support
- [ ] Voice command support
- [ ] Biometric template storage
- [ ] Cross-device sync
- [ ] Analytics integration
- [ ] A/B testing framework

## Support

For issues or questions:
- Check the main documentation: `BIOMETRIC_AUTH_IMPROVEMENTS.md`
- Review the code comments in `BiometricAuth.tsx`
- Test with Lighthouse and axe DevTools
- Consult Web Accessibility Guidelines (WCAG 2.1)

---

**Version**: 2.0.0  
**Last Updated**: December 22, 2025
