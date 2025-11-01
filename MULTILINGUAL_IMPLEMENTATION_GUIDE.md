# Multi-Language Implementation Guide

## ✅ Completed Setup

### 1. Dependencies Installed
- `i18next` - Core i18n framework
- `react-i18next` - React integration
- `i18next-browser-languagedetector` - Automatic language detection

### 2. Translation Files Created
- **English**: `src/locales/en/translation.json`
- **Tamil**: `src/locales/ta/translation.json`

### 3. Configuration
- **i18n Config**: `src/i18n.ts` - Configured with language detection and localStorage caching
- **Main Entry**: `src/main.tsx` - i18n imported and initialized

### 4. Header Component Updated
- Language selector dropdown added to navbar (desktop)
- Mobile language selector added to mobile menu
- Globe icon for language selection
- All navigation items use translation keys
- Language preference saved to localStorage

### 5. HomePage Updated
- All text strings replaced with translation keys
- Example of how to use `useTranslation` hook

## 🔧 How to Add Translations to Other Pages

### Step 1: Import the Hook
```tsx
import { useTranslation } from 'react-i18next';
```

### Step 2: Use the Hook in Component
```tsx
const MyComponent: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('myPage.title')}</h1>
      <p>{t('myPage.description')}</p>
    </div>
  );
};
```

### Step 3: Replace Hardcoded Strings
**Before:**
```tsx
<Button>Submit Petition</Button>
<p>Search petitions...</p>
```

**After:**
```tsx
<Button>{t('petition.submit')}</Button>
<p>{t('browse.searchPlaceholder')}</p>
```

## 📄 Pages Needing Translation Updates

### Priority 1 - User-Facing Pages
- [x] ✅ Header.tsx
- [x] ✅ HomePage.tsx
- [ ] BrowsePetitionsPage.tsx
- [ ] PetitionDetailPage.tsx
- [ ] MyPetitionsPage.tsx
- [ ] SignInPage.tsx
- [ ] SignUpPage.tsx
- [ ] AboutPage.tsx

### Priority 2 - Admin Pages
- [ ] AdminDashboard.tsx
- [ ] AnalyticsPage.tsx
- [ ] UserManagementPage.tsx
- [ ] AdminSettingsPage.tsx

### Priority 3 - Components
- [ ] Footer.tsx
- [ ] PetitionCreatePage.tsx
- [ ] EditPetition.tsx

## 📝 Translation Key Reference

All translation keys are organized in the JSON files under these main sections:

- `nav.*` - Navigation items
- `home.*` - Home page content
- `petition.*` - Petition-related text
- `browse.*` - Browse petitions page
- `myPetitions.*` - My petitions page
- `admin.*` - Admin-specific text
- `auth.*` - Authentication pages
- `about.*` - About page
- `analytics.*` - Analytics dashboard
- `common.*` - Common UI elements (buttons, labels, etc.)
- `footer.*` - Footer content
- `notifications.*` - Toast notifications

## 🌐 Language Switching

Users can switch languages in two ways:

1. **Desktop**: Language dropdown in the header navbar (next to search)
2. **Mobile**: Language selector in the mobile menu

The selected language is:
- Automatically applied to all text
- Saved to localStorage
- Persists across sessions

## 🎨 Adding New Languages

To add a new language (e.g., Hindi):

1. Create a new directory: `src/locales/hi/`
2. Create translation file: `src/locales/hi/translation.json`
3. Copy the structure from `en/translation.json`
4. Translate all values to Hindi
5. Update `src/i18n.ts`:
```tsx
import hiTranslation from './locales/hi/translation.json';

const resources = {
  en: { translation: enTranslation },
  ta: { translation: taTranslation },
  hi: { translation: hiTranslation }  // Add this
};
```
6. Update Header.tsx language selector:
```tsx
<SelectItem value="hi">हिंदी (Hindi)</SelectItem>
```

## 🔍 Quick Example: Updating BrowsePetitionsPage

**Step 1**: Add import
```tsx
import { useTranslation } from 'react-i18next';
```

**Step 2**: Get translation function
```tsx
const BrowsePetitionsPage: React.FC = () => {
  const { t } = useTranslation();
  // ... rest of code
```

**Step 3**: Replace strings
```tsx
// Before
<h1>Browse Petitions</h1>
<input placeholder="Search petitions..." />

// After
<h1>{t('browse.title')}</h1>
<input placeholder={t('browse.searchPlaceholder')} />
```

## 📋 Testing Checklist

- [x] Language selector visible in header
- [x] Can switch between English and Tamil
- [x] Selected language persists after page reload
- [x] HomePage displays correctly in both languages
- [ ] All pages display correctly in both languages
- [ ] Mobile menu language selector works
- [ ] Error messages are translated
- [ ] Form validation messages are translated
- [ ] Toast notifications are translated

## 🚀 Current Status

**Implemented:**
- ✅ i18n infrastructure fully set up
- ✅ English and Tamil translation files complete
- ✅ Language selector in navbar (desktop & mobile)
- ✅ HomePage fully translated
- ✅ Header navigation fully translated

**Next Steps:**
1. Update BrowsePetitionsPage with translations
2. Update PetitionDetailPage with translations
3. Update Sign In/Sign Up pages
4. Update Admin pages
5. Test all pages in both languages
6. Consider adding more languages (Hindi, Kannada, etc.)

## 💡 Tips

1. **Consistency**: Use consistent translation keys across similar pages
2. **Context**: Group related translations under the same parent key
3. **Placeholders**: For dynamic content, use interpolation:
   ```tsx
   // In translation.json
   "welcome": "Welcome, {{name}}"
   
   // In component
   t('welcome', { name: user.firstName })
   ```
4. **Plurals**: i18next supports pluralization:
   ```json
   "petition_count": "{{count}} petition",
   "petition_count_plural": "{{count}} petitions"
   ```

## 📚 Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- Translation files location: `src/locales/[lang]/translation.json`
- Configuration file: `src/i18n.ts`
