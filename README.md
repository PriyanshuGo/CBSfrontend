# Content Broadcasting System (CBS) - Frontend

A modern React-based content broadcasting platform built with Next.js 16, Redux Toolkit, and Tailwind CSS. Supports role-based access for principals, teachers, and public users with live streaming capabilities.

## Features

- 🔐 **Authentication & Authorization** - JWT-based login with role-based routing (principal/teacher)
- 📡 **Live Content Streaming** - Real-time content delivery to public viewers
- 📚 **Content Management** - Teachers can upload and manage educational content
- ✅ **Content Approval Workflow** - Principals can approve/reject teacher submissions
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ⚡ **State Management** - Redux Toolkit with RTK Query for efficient caching and synchronization
- 🔄 **API Integration** - Axios with interceptors for secure authenticated requests

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **React**: 19.2.4
- **State Management**: Redux Toolkit 2.11.2 + RTK Query
- **HTTP Client**: Axios 1.16.0
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner

## Prerequisites

- Node.js 18+ or higher
- npm, yarn, pnpm, or bun package manager
- Backend API running (see Environment Variables)

## Installation

### 1. Clone the Repository

```bash
cd content-broadcast-frontend
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

Or using pnpm:
```bash
pnpm install
```

Or using bun:
```bash
bun install
```

### 3. Environment Setup

Create a `.env.local` file in the project root:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
# or for production:
# NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

**Important**: The `NEXT_PUBLIC_` prefix makes this variable accessible in the browser. Never expose sensitive secrets with this prefix.

## Development

### Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

**Note**: The app redirects `/` to `/live` by default. To access the login page, visit [http://localhost:3000/login](http://localhost:3000/login)

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.js                 # Root layout with Redux & Navbar
│   ├── page.js                   # Home redirect
│   ├── login/page.jsx            # Login page (public)
│   ├── live/page.jsx             # Live content viewer (public)
│   ├── principal/dashboard/      # Principal dashboard (protected)
│   └── teacher/dashboard/        # Teacher dashboard (protected)
│       └── upload/               # Content upload
│
├── components/                   # Reusable React components
│   ├── layout/navbar.jsx         # Navigation bar
│   └── ui/                       # shadcn/ui components
│
├── features/auth/                # Redux auth slice
├── services/api/                 # API integration layer
│   ├── apiSlice.js              # RTK Query setup
│   ├── axiosInstance.js         # Axios configuration
│   └── baseQuery.js             # Custom RTK Query base
│
├── store/                        # Redux store configuration
├── utils/                        # Helper utilities
└── lib/                          # Library utilities
```

See [Frontend-notes.txt](./Frontend-notes.txt) for detailed architecture documentation.

## Authentication Flow

### Login (User → Principal/Teacher Dashboard)

1. User navigates to `/login`
2. Enters credentials (email, password)
3. Upon successful login:
   - Access token stored in localStorage
   - User data stored in Redux state and localStorage
   - Redirected to role-specific dashboard:
     - **principal** → `/principal/dashboard`
     - **teacher** → `/teacher/dashboard`

### Token Management

- Tokens automatically added to authenticated requests via Axios interceptor
- Token stored in localStorage for persistence
- On logout, token removed and user redirected to `/live`

### Protected Routes

Currently implemented via client-side checks. For production, implement server-side middleware protection:

```javascript
// Routes requiring authentication:
- /principal/* (principal role only)
- /teacher/*   (teacher role only)
- /live        (public, no auth required)
- /login       (public, redirects to dashboard if already authenticated)
```

## API Integration

### Base Query

All API requests use a custom Axios-based query with automatic token injection:

```javascript
// Public request (no auth)
const response = await publicAxios.post('/login', credentials);

// Authenticated request (auto-includes Bearer token)
const response = await privateAxios.get('/content');
```

### RTK Query Endpoints

Endpoints are organized by feature:

- **auth**: Login, logout
- **content**: CRUD operations for educational content
- **approval**: Content approval workflows
- **live**: Live streaming queries

### Error Handling

API errors are caught and formatted:

```javascript
try {
  const response = await login(formData).unwrap();
} catch (error) {
  console.error(error?.data?.message); // API error message
}
```

## State Management

### Redux Store

```javascript
store = {
  auth: {
    user: { id, name, email, role },
    accessToken: string,
    isAuthenticated: boolean
  },
  api: { /* RTK Query caching */ }
}
```

### Using Redux in Components

```javascript
// Read state
const { user, isAuthenticated } = useSelector(state => state.auth);

// Dispatch actions
const dispatch = useDispatch();
dispatch(setCredentials({ user, accessToken }));

// Use API mutations
const [login, { isLoading }] = useLoginMutation();
```

## Building for Production

### Build

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### Start Production Server

```bash
npm run start
```

The application runs on [http://localhost:3000](http://localhost:3000)

### Deployment Options

- **Vercel** (Recommended for Next.js) - [Deploy Guide](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- **Docker** - Create a Dockerfile (template provided on request)
- **Traditional Server** - Build and run with `npm start`

## Configuration Files

- **next.config.mjs** - Next.js configuration (React Compiler enabled, image optimization)
- **tailwind.config.js** - Tailwind CSS customization
- **postcss.config.mjs** - PostCSS plugins
- **jsconfig.json** - Module path aliases (@/components, @/utils, etc.)
- **.env.local** - Environment variables (not version controlled)

## Path Aliases

The project uses module aliases for cleaner imports:

```javascript
// Instead of:
import Button from '../../../../components/ui/button';

// Use:
import Button from '@/components/ui/button';
```

Available aliases (from jsconfig.json):
- `@/` → `./src/`
- `@/components/` → `./src/components/`
- `@/services/` → `./src/services/`
- etc.

## Common Issues & Solutions

### Issue: API requests fail with CORS error

**Solution**: Ensure backend is running and `NEXT_PUBLIC_API_BASE_URL` is correctly configured in `.env.local`

### Issue: Token not persisting after page reload

**Solution**: Token persists in localStorage, but Redux state is lost. The navbar component rehydrates from localStorage on mount.

### Issue: Protected routes accessible without authentication

**Solution**: Currently uses client-side checks. Implement middleware protection in `src/middleware.js` for production.

### Issue: Hot reload not working

**Solution**: Ensure you're in the project directory when running `npm run dev`. Clear `.next` folder and restart.

## Security Considerations

⚠️ **Development Notes**:
- Tokens stored in localStorage (vulnerable to XSS in production)
- Consider moving to httpOnly cookies with backend cooperation
- No CSRF protection implemented yet
- No token refresh mechanism (requires re-login on expiry)
- Route protection is client-side only

**Production Recommendations**:
1. Implement server-side route protection with middleware
2. Use httpOnly cookies for token storage
3. Add CSRF tokens for state-changing operations
4. Implement proper token refresh strategy
5. Add rate limiting and request validation
6. Enable HTTPS only

## Testing

Currently no test suite implemented. To add tests:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Create test files alongside components with `.test.js` extension.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and test thoroughly
3. Commit with clear messages: `git commit -m "Add feature description"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## Troubleshooting

### Clean Install

If you encounter dependency issues:

```bash
# Remove dependencies
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Clear Next.js Cache

```bash
# Remove build cache
rm -rf .next

# Restart dev server
npm run dev
```

## Additional Resources

- [Frontend Architecture Documentation](./Frontend-notes.txt) - Detailed system design
- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Toolkit Guide](https://redux-toolkit.js.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Axios Documentation](https://axios-http.com/)

## License

Project developed as part of Content Broadcasting System initiative.

## Support

For issues or questions:
1. Check [Frontend-notes.txt](./Frontend-notes.txt) for architecture details
2. Review error messages in browser console
3. Check backend API logs for server-side errors
4. Contact development team
