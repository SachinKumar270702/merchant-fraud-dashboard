# Contributing to Merchant Fraud Dashboard

Thank you for your interest in contributing to the Merchant Fraud Dashboard! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Git

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/merchant-fraud-dashboard.git
   cd merchant-fraud-dashboard
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

## 🔧 Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(rbac): add role-based access control system
fix(dashboard): resolve KPI calculation error
docs(readme): update installation instructions
test(auth): add authentication flow tests
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Writing Tests

- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

**Example:**
```typescript
describe('ProtectedRoute', () => {
  it('should redirect unauthenticated users to login', () => {
    // Arrange
    const mockUser = null;
    
    // Act
    render(<ProtectedRoute user={mockUser}>Content</ProtectedRoute>);
    
    // Assert
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});
```

## 🎨 Code Style

### TypeScript Guidelines

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type - use proper typing
- Use meaningful variable and function names

### React Guidelines

- Use functional components with hooks
- Follow React best practices
- Use proper prop types
- Implement proper error boundaries

### Styling Guidelines

- Use Styled Components for styling
- Follow mobile-first responsive design
- Use consistent spacing and colors
- Maintain accessibility standards

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── __tests__/      # Component tests
│   └── index.ts        # Component exports
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── contexts/           # React contexts
└── docs/               # Documentation
```

## 🔒 Security Guidelines

### RBAC Development

When working on Role-Based Access Control features:

- Always validate permissions on both client and server
- Use the principle of least privilege
- Test with different user roles
- Document permission requirements

### Authentication

- Never commit credentials or API keys
- Use environment variables for sensitive data
- Implement proper session management
- Follow security best practices

## 📋 Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Run the full test suite**: `npm test`
4. **Check code style**: `npm run lint`
5. **Build successfully**: `npm run build`

### PR Template

When creating a pull request, include:

- **Description** of changes
- **Type of change** (feature, bugfix, etc.)
- **Testing** performed
- **Screenshots** (if UI changes)
- **Breaking changes** (if any)

### Review Process

1. **Automated checks** must pass (tests, linting, build)
2. **Code review** by maintainers
3. **Testing** in different environments
4. **Documentation** review if applicable

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test with the latest version**
3. **Check the documentation**

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]
```

## 💡 Feature Requests

### Before Requesting

1. **Check existing issues** and discussions
2. **Consider the scope** and impact
3. **Think about implementation** approach

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.
```

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `wontfix` - This will not be worked on

## 🎯 Areas for Contribution

### High Priority

- **RBAC enhancements** - Additional permission types
- **Dashboard widgets** - New KPI cards and charts
- **Mobile optimization** - Improved mobile experience
- **Accessibility** - WCAG compliance improvements

### Medium Priority

- **Performance optimization** - Bundle size reduction
- **Testing** - Increased test coverage
- **Documentation** - API documentation, tutorials
- **Internationalization** - Multi-language support

### Good First Issues

- **UI improvements** - Small styling fixes
- **Documentation** - README updates, code comments
- **Tests** - Adding missing test cases
- **Bug fixes** - Minor bug fixes

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Documentation** - Check existing docs first

## 🙏 Recognition

Contributors will be recognized in:

- **README.md** - Contributors section
- **Release notes** - Feature acknowledgments
- **GitHub** - Contributor graphs and statistics

Thank you for contributing to the Merchant Fraud Dashboard! 🎉