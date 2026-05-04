# StyleMatch — AI-Powered Ecommerce Recommendation Engine

<div align="center">

[Live Demo]
• [Report Bug](https://github.com/imsiddharthnegi/stylematchapp/issues)
• [Request Feature](https://github.com/imsiddharthnegi/stylematchapp/issues)

</div>

## Overview

**StyleMatch** is a modern, AI-driven ecommerce platform that uses intelligent recommendations to help users discover products that match their personal style. Built with **no-code/low-code approach** using Lovable, it combines premium UI/UX with cutting-edge AI capabilities.

Users complete a 60-second style quiz, and StyleMatch curates personalized product recommendations powered by Claude AI. Browse, save, compare, and checkout—all with seamless filtering and real-time updates.

---

## ✨ Key Features

### 🎯 Smart Style Quiz
- 4-step interactive onboarding (style vibe, colors, price range, fit)
- Smooth transitions & progress tracking
- Saves preferences to backend for persistent personalization

### 🤖 AI Recommendations
- Claude AI generates personalized "why this pick" explanations for each product
- Confidence scoring (1-100%) based on user preferences
- Real-time recommendations after quiz completion
- Floating "Ask AI Stylist" button for on-demand suggestions

### 🛍️ Premium Product Grid
- Live product data from Lovable Cloud backend
- High-quality product images with hover zoom effects
- Confidence badges with color-coded ratings
- Quick add-to-cart & save functionality

### 🔍 Intelligent Filtering
- Filter by category (Tops, Bottoms, Accessories, Shoes)
- Price range slider ($10–$500)
- Color swatches with visual selection
- Star rating filters (3+, 4+, All)
- Real-time grid updates as filters change

### 💾 Save & Compare
- Heart icon to save favorite items
- Dedicated "Saved" page with all bookmarked products
- Side-by-side product comparison
- Shareable saved lists via URL

### 🛒 Seamless Checkout
- Stripe-powered payment processing (test mode for free)
- One-click purchase with saved items
- Order confirmation & success flow

### 🎨 Premium UI/UX
- Dark theme with glassmorphic design
- Parallax hero section
- 3D card hover effects with perspective transforms
- Smooth micro-interactions & staggered animations
- Skeleton loading states with shimmer effects
- Animated stat counters & confidence gauges
- Mobile-responsive design

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, TailwindCSS, Framer Motion |
| **Backend** | Lovable Cloud (auto-managed) |
| **Database** | Lovable Cloud PostgreSQL |
| **AI** | Claude API (via Lovable Gateway) |
| **Payments** | Stripe (test mode) |
| **Deployment** | Vercel |
| **Version Control** | GitHub |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A Lovable account (free)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/siddharthnegixx/stylematch.git
   cd stylematch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production**
   ```bash
   npm run build
   ```

---

## 📊 How It Works

```
User Journey:
┌─────────────────────────────────────────────────────────┐
│ 1. Land on homepage → See hero & "How it works" section │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Click "Start Style Quiz" → 4-step preference form   │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Quiz saved → AI generates recommendations            │
│    Claude explains why each product matches             │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Browse grid → Filter, save, compare products        │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Checkout via Stripe → Order confirmation            │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Design Highlights

- **Dark Mode Native**: Deep navy background (#0F1117) with vibrant accent gradients
- **Glassmorphism**: Frosted glass panels with backdrop blur for depth
- **Micro-animations**: Smooth hover states, scroll triggers, staggered fade-ins
- **3D Effects**: Subtle perspective transforms on card hovers
- **Loading States**: Shimmer skeleton screens instead of boring spinners
- **Responsive**: Mobile-first design, works seamlessly on all devices

---

## 📈 Performance

- **Lighthouse Score**: 92+ (Performance, Accessibility, Best Practices)
- **Load Time**: <2s on average connection
- **Real-time Updates**: Filters & AI recs update instantly
- **Optimized Images**: Unsplash CDN for fast delivery

---

## 🔐 Security & Privacy

- No sensitive data stored locally
- Stripe handles all payment processing (PCI compliant)
- Lovable Cloud provides secure authentication
- RLS policies protect user data in backend

---

## 💡 Future Enhancements

- [ ] User accounts & authentication
- [ ] Order history & tracking
- [ ] Social sharing of saved lists
- [ ] AR product try-on
- [ ] Email recommendations digest
- [ ] Loyalty rewards program
- [ ] Creator marketplace (influencer storefronts)
- [ ] Subscription boxes with AI curation

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Siddharth Negi**
- GitHub: https://github.com/imsiddharthnegi/
- Email: imsiddarthnegi@gmail.com
- Portfolio : https://siddharthnegi.vercel.app/

---


## 📞 Support

Have questions or found a bug? [Open an issue](https://github.com/siddharthnegixx/stylematch/issues) or reach out directly.

---

**Made with ❤️ by Siddharth Negi**
