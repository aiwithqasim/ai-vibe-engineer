# AI Vibe Engineer í´–

A comprehensive repository showcasing **multiple AI-powered Kanban board implementations** and learning projects built as part of the Complete AI Coder Course. This repository demonstrates how different AI coding assistants (Codex, Copilot, Cursor, and Antigravity) can be used to build the same project with varying approaches and results.

## í³š Project Overview

This repository contains 5 complementary projects:

### 1. **Antigravity Kanban** í³±
A modern Kanban board implementation with advanced features.

- **Tech Stack**: Next.js, TypeScript, React
- **Features**:
  - Drag-and-drop card management
  - Renameable columns (To Do, In Progress, In Review, Done, Archived)
  - Add/delete/move cards between columns
  - Full test coverage with Vitest
  - E2E testing with Playwright
  - ESLint configuration for code quality

**Quick Start**:
```bash
cd antigravity_kanban/frontend
npm install
npm run dev
```

Visit: http://localhost:3000

**Testing**:
```bash
npm run lint
npm run test
npm run test:e2e
```

---

### 2. **Codex Kanban** í· 
Kanban implementation built with OpenAI's Codex AI assistant.

- **Tech Stack**: Next.js, TypeScript, React
- **AI Assistant**: OpenAI Codex
- **Highlights**:
  - Community contributions and agent configurations
  - Comprehensive AGENTS.md for AI-assisted development
  - Production-ready implementation

**Quick Start**:
```bash
cd codex_kanban/frontend
npm install
npm run dev
```

**Documentation**:
- [AGENTS.md](./codex_kanban/AGENTS.md) - AI assistant configuration
- [Community Contributions](./codex_kanban/community_contributions/)

---

### 3. **Copilot Kanban** íº€
Full-featured Kanban board built with GitHub Copilot.

- **Tech Stack**: Next.js, React, Jest, Playwright
- **AI Assistant**: GitHub Copilot
- **Features**:
  - Complete implementation with all MVP features
  - Jest unit tests
  - Playwright E2E tests
  - Context management with React Context
  - Comprehensive documentation

**Quick Start**:
```bash
cd copilot_kanban/frontend
npm install
npm run dev
```

**Documentation**:
- [QUICK_REFERENCE.md](./copilot_kanban/QUICK_REFERENCE.md)
- [DELIVERY_SUMMARY.md](./copilot_kanban/DELIVERY_SUMMARY.md)
- [AGENTS.md](./copilot_kanban/AGENTS.md)

---

### 4. **Cursor Kanban** âœ¨
Kanban implementation built with Cursor IDE's AI capabilities.

- **Tech Stack**: Next.js, TypeScript, React
- **AI Assistant**: Cursor IDE
- **Highlights**:
  - Comprehensive MVP implementation plan
  - Full test coverage (Jest + Playwright)
  - Production-ready code
  - ESLint configuration

**Quick Start**:
```bash
cd cursor_kanban/frontend
npm install
npm run dev
```

**Documentation**:
- [kanban_mvp_implementation.plan.md](./cursor_kanban/kanban_mvp_implementation.plan.md)

---

### 5. **Instant Starter** í¾®
A 3D first-person shooter game implementation.

- **Tech Stack**: HTML5, CSS3, JavaScript
- **Features**:
  - Browser-based 3D arena
  - Player vs Computer opponent
  - Arrow key controls
  - Real-time gameplay

**Quick Start**:
```bash
cd instant_starter
# Open index.html in your browser
```

---

## í¾¯ Key Features Across Projects

All Kanban implementations include:

âœ… **MVP Features**:
- Renameable columns (To Do, In Progress, In Review, Done, Archived)
- Add new cards
- Delete cards
- Move cards between columns
- Drag-and-drop interface

âœ… **Testing**:
- Unit tests (Vitest/Jest)
- E2E tests (Playwright)
- ESLint for code quality

âœ… **Technology**:
- Modern React with TypeScript
- Next.js framework
- Responsive design
- Professional code structure

---

## í´– AI Assistants Comparison

This repository serves as a learning resource comparing different AI coding assistants:

| Assistant | Project | Strengths |
|-----------|---------|-----------|
| OpenAI Codex | codex_kanban | Code generation, natural language understanding |
| GitHub Copilot | copilot_kanban | Context-aware suggestions, IDE integration |
| Cursor IDE | cursor_kanban | Complete AI-focused development experience |
| Antigravity | antigravity_kanban | Modern tooling, comprehensive testing |

---

## í³‹ Project Structure

```
ai-vibe-engineer/
â”œâ”€â”€ antigravity_kanban/
â”‚   â”œâ”€â”€ frontend/
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ e2e/
â”‚   â”‚   â””â”€â”€ package.json
â”‚   â””â”€â”€ README.md
â”œâ”€â”€ codex_kanban/
â”‚   â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ community_contributions/
â”‚   â””â”€â”€ README.md
â”œâ”€â”€ copilot_kanban/
â”‚   â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ AGENTS.md
â”‚   â””â”€â”€ QUICK_REFERENCE.md
â”œâ”€â”€ cursor_kanban/
â”‚   â”œâ”€â”€ frontend/
â”‚   â””â”€â”€ README.md
â”œâ”€â”€ instant_starter/
â”‚   â”œâ”€â”€ game.js
â”‚   â”œâ”€â”€ index.html
â”‚   â””â”€â”€ style.css
â””â”€â”€ LICENSE
```

---

## íº€ Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- Modern web browser

### Installation & Setup

**For any Kanban project**:

1. Clone the repository:
```bash
git clone https://github.com/aiwithqasim/ai-vibe-engineer.git
cd ai-vibe-engineer
```

2. Choose a project and navigate to it:
```bash
cd [antigravity_kanban | codex_kanban | copilot_kanban | cursor_kanban]/frontend
```

3. Install dependencies:
```bash
npm install
```

4. Start development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

---

## í·ª Testing

### Run Tests

```bash
# Unit tests
npm run test

# Linting
npm run lint

# E2E tests
npm run test:e2e
```

### Build for Production

```bash
npm run build
npm start
```

---

## í³– Documentation

Each project contains comprehensive documentation:

- **AGENTS.md** - Configuration for AI-assisted development
- **README.md** - Project-specific setup and features
- **Implementation Plans** - Detailed development guides
- **Community Contributions** - Real-world agent configurations from users

---

## í´ Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Sharing Successful Agent Configurations

If you've created an effective AGENTS.md configuration, consider contributing it to the community! See individual project folders for contribution guidelines.

---

## í³ License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## í¾“ Learning Resources

This repository is part of the **Complete AI Coder Course**. 

### What You'll Learn:

- How to use AI assistants for software development
- Building modern web applications with React and Next.js
- Writing effective AI prompts (AGENTS.md)
- Test-driven development practices
- Comparing AI coding assistants
- Full-stack development techniques

---

## í²¡ Quick Reference

### Common Commands

**Development**:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
```

**Quality**:
```bash
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run test:watch   # Watch mode testing
```

---

## í´— Related Projects

- [Original Kanban Template](https://github.com/ed-donner/kanban)
- [Complete AI Coder Course](https://www.complete-ai-coder.com)

---

## í¹‹ Support

For questions or issues:

1. Check the individual project README files
2. Review the AGENTS.md files for AI configuration help
3. Open an issue on GitHub
4. Check community contributions for similar issues

---

## í¼Ÿ Acknowledgments

- Course materials from **Complete AI Coder Course**
- Template based on **Ed Donner's Kanban Project**
- Built with cutting-edge AI coding assistants
- Community contributions from course students

---

**Last Updated**: March 29, 2026

**Repository**: [ai-vibe-engineer](https://github.com/aiwithqasim/ai-vibe-engineer)

**Owner**: [@aiwithqasim](https://github.com/aiwithqasim)
