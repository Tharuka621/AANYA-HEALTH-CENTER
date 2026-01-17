# Aanya Health Center Management System

A comprehensive React-based health center management system built with Material-UI, featuring role-based access control, appointment management, prescription handling, lab test management, and pharmacy integration.

## 🚀 Features

### Core Features
- **Role-based Authentication** - Support for Admin, Doctor, Nurse, Receptionist, Pharmacist, Lab Technician, and Patient roles
- **Appointment Management** - Schedule, manage, and track patient appointments
- **Prescription System** - Digital prescription creation and management
- **Lab Test Management** - Request, track, and upload lab test results
- **Pharmacy Integration** - Inventory management and prescription dispensing
- **Patient Portal** - Access to appointments, prescriptions, and lab reports
- **Responsive Design** - Mobile-first design with Material-UI components

### Technical Features
- **React 18+** with TypeScript
- **Material-UI v5** for consistent, accessible UI components
- **React Router v6** for client-side routing
- **React Query** for efficient data fetching and caching
- **Mock API** with realistic data and simulated delays
- **JWT-like Authentication** with localStorage persistence
- **Accessibility** - WCAG AA compliant with proper ARIA labels

## 🛠️ Technology Stack

- **Frontend**: React 18.3+, TypeScript
- **UI Framework**: Material-UI v5 (@mui/material)
- **Routing**: React Router v6
- **State Management**: React Query (@tanstack/react-query)
- **Build Tool**: Vite
- **Date Handling**: date-fns
- **Icons**: Material-UI Icons (@mui/icons-material)
- **Date Pickers**: MUI X Date Pickers (@mui/x-date-pickers)

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aanya-health-center
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 🔐 Demo Credentials

Use these credentials to test different user roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aanya.com | admin123 |
| Doctor | doctor@aanya.com | doctor123 |
| Nurse | nurse@aanya.com | nurse123 |
| Receptionist | receptionist@aanya.com | reception123 |
| Pharmacist | pharmacist@aanya.com | pharma123 |
| Lab Technician | labtech@aanya.com | lab123 |
| Patient | patient@aanya.com | patient123 |

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (Button, Card, Modal, etc.)
│   └── Layout/          # Layout components (Header, Sidebar, Footer)
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication hooks
│   ├── useAppointments.ts
│   ├── usePrescriptions.ts
│   ├── useLabTests.ts
│   └── useMedicines.ts
├── layouts/             # Layout components
│   ├── MainLayout.tsx   # Public pages layout
│   └── DashboardLayout.tsx # Dashboard layout
├── pages/               # Page components
│   ├── Home.tsx         # Landing page
│   ├── Login.tsx        # Login page
│   ├── Signup.tsx       # Registration page
│   ├── ForgotPassword.tsx
│   └── dashboard/       # Dashboard pages
│       ├── PatientDashboard.tsx
│       ├── DoctorDashboard.tsx
│       ├── ReceptionistDashboard.tsx
│       ├── PharmacistDashboard.tsx
│       ├── LabDashboard.tsx
│       └── AdminDashboard.tsx
├── services/            # API services
│   ├── api.ts          # Mock API with CRUD operations
│   └── auth.ts         # Authentication service
├── theme/              # Material-UI theme configuration
│   └── index.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## 🎨 Customization

### Theme Customization
The Material-UI theme is configured in `src/theme/index.ts`. You can customize:
- Color palette (primary, secondary, error, etc.)
- Typography settings
- Component styling overrides
- Spacing and shape configurations

### Adding New Features
1. **New Page**: Create component in `src/pages/`
2. **New Component**: Add to `src/components/`
3. **New Hook**: Create in `src/hooks/`
4. **New API**: Extend `src/services/api.ts`
5. **New Types**: Add to `src/types/index.ts`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set environment variables in Netlify dashboard

### Environment Variables
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_DEBUG_MODE=false
```

## 🔄 Replacing Mock API with Real Backend

To connect to a real backend API:

1. **Update API Base URL**
   ```env
   VITE_API_BASE_URL=https://your-api-domain.com/api
   ```

2. **Replace Mock Services**
   - Update `src/services/api.ts` to use real HTTP requests
   - Replace mock data with actual API calls
   - Update authentication in `src/services/auth.ts`

3. **Update Types**
   - Modify `src/types/index.ts` to match your API response structure
   - Add any additional types needed

4. **Handle Real Authentication**
   - Implement proper JWT token handling
   - Add token refresh logic
   - Handle authentication errors

## 🖼️ Replacing Doctor Image

To replace the placeholder doctor image:

1. **Add Image File**
   - Place your image in `src/assets/doctor.png`
   - Or update the import path in `src/pages/Home.tsx`

2. **Update Component**
   ```tsx
   // In src/pages/Home.tsx
   <Avatar
     sx={{
       width: 300,
       height: 300,
       backgroundImage: 'url(/path-to-your-image)',
       backgroundSize: 'cover',
       backgroundPosition: 'center',
     }}
   >
     <MedicalIcon sx={{ fontSize: 120, color: 'white' }} />
   </Avatar>
   ```

## ♿ Accessibility Features

- **Keyboard Navigation** - All interactive elements are keyboard accessible
- **Screen Reader Support** - Proper ARIA labels and semantic HTML
- **Color Contrast** - WCAG AA compliant color combinations
- **Focus Management** - Visible focus indicators
- **Skip Links** - Skip to main content functionality
- **Alt Text** - Descriptive alt text for all images

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with different user roles
- [ ] Navigate between different dashboard sections
- [ ] Test responsive design on mobile/tablet
- [ ] Verify keyboard navigation
- [ ] Check screen reader compatibility
- [ ] Test form validation
- [ ] Verify error handling

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@aanyahealth.com
- Documentation: [Project Wiki](link-to-wiki)

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Basic authentication and role management
- [x] Core dashboard functionality
- [x] Mock API implementation
- [x] Responsive design

### Phase 2 (Future)
- [ ] Real backend integration
- [ ] Advanced reporting and analytics
- [ ] Mobile app development
- [ ] Integration with external systems
- [ ] Advanced security features
- [ ] Multi-language support

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- React team for the amazing framework
- Vite team for the fast build tool
- All contributors and testers

---

**Built with ❤️ for healthcare professionals and patients**

