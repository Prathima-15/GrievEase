# Multi-Language Testing Guide

## 🎯 How to Test the Multi-Language Feature

### Quick Start
1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Look for the language selector**
   - **Desktop**: In the navbar, next to the search bar, you'll see a dropdown with a globe icon (🌐)
   - **Mobile**: Open the hamburger menu, and you'll see the language selector at the top

3. **Switch languages**
   - Click the dropdown
   - Select "தமிழ் (Tamil)" to switch to Tamil
   - Select "English" to switch back to English

### What Changes When You Switch Languages

✅ **Header/Navigation**
- All menu items (Home, Browse Petitions, About, etc.)
- Search placeholder text
- Sign In/Sign Out buttons

✅ **Home Page**
- Hero section title and subtitle
- "Create a Petition" and "Browse Petitions" buttons
- "How It Works" section with all 3 steps
- All feature descriptions

✅ **Browse Petitions Page**
- Page title
- Search placeholder
- Filter labels
- Sort options (Newest, Oldest, Most Signatures)
- "No petitions found" message
- Loading states

### Language Persistence
- Your language choice is **automatically saved** to localStorage
- When you refresh the page or come back later, your language preference is **remembered**
- You can close and reopen the browser - your choice persists!

## 📱 Testing Checklist

### Desktop View
- [ ] Language dropdown visible in navbar
- [ ] Globe icon appears next to dropdown
- [ ] Can select English
- [ ] Can select Tamil (தமிழ்)
- [ ] Home page updates immediately after selection
- [ ] Browse page updates immediately after selection
- [ ] Navigation menu items change language
- [ ] Search placeholder text changes

### Mobile View
- [ ] Open hamburger menu
- [ ] Language selector visible at top of mobile menu
- [ ] Can switch between languages
- [ ] Page content updates immediately
- [ ] Mobile menu closes properly after interaction

### Functionality Tests
- [ ] Create a petition - check if form works in both languages
- [ ] Browse petitions - verify search works in both languages
- [ ] Sign in/Sign up - test authentication flows
- [ ] Check that data from backend (petition titles, descriptions) displays correctly regardless of UI language

## 🌐 Supported Languages

Currently configured:
1. **English** (en) - Default
2. **Tamil** (தமிழ்) (ta)

## 🐛 Troubleshooting

### Language not changing?
- Check browser console for errors
- Verify localStorage is enabled
- Try clearing browser cache and localStorage
- Restart the dev server

### Some text not translating?
- This is expected! Not all pages are updated yet
- See `MULTILINGUAL_IMPLEMENTATION_GUIDE.md` for list of pages that need translation
- Currently implemented: Header, HomePage, BrowsePetitionsPage

### Language resets to English?
- Check if localStorage is working: Open Dev Tools → Application → Local Storage
- Look for a key named "language" with value "en" or "ta"

## 📝 Example User Journey

1. **New User Visits Site (English)**
   - Opens website → Default language is English
   - Sees "Your Voice Matters" on home page
   - Navbar shows "Home", "Browse Petitions", "About"

2. **User Switches to Tamil**
   - Clicks language dropdown in navbar
   - Selects "தமிழ் (Tamil)"
   - **Instant changes**:
     - Hero title becomes "உங்கள் குரல் முக்கியம்"
     - Navbar shows "முகப்பு", "மனுக்களை உலாவு", "பற்றி"
     - Buttons update to Tamil text

3. **User Navigates**
   - Clicks "மனுக்களை உலாவு" (Browse Petitions)
   - Page title: "மனுக்களை உலாவு"
   - Search box: "தலைப்பு அல்லது விளக்கத்தின் மூலம் தேடுங்கள்"
   - All UI elements in Tamil

4. **User Returns Later**
   - Closes browser
   - Opens website again tomorrow
   - **Language is still Tamil** (saved in localStorage)
   - No need to select again

## 🎨 Visual Indicators

- **Globe Icon (🌐)**: Indicates language selector
- **Language Code Display**: Shows current language in dropdown
- **Bilingual Labels**: Both English and Tamil names shown in dropdown for clarity

## ⚡ Performance Notes

- Language switching is **instant** (no page reload required)
- Translation files are **preloaded** on app start
- Minimal performance impact (<20KB additional bundle size)

## 🔄 Next Steps for Full Translation

See `MULTILINGUAL_IMPLEMENTATION_GUIDE.md` for:
- List of pages needing translation
- How to add translations to new pages
- How to add more languages (Hindi, Kannada, etc.)
