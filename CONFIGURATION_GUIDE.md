# Configuration Guide - What File to Edit?

## Simple Answer

**Edit ONLY the `.env` file!**

```
┌─────────────────────────────────────────────────────────┐
│  Files You Work With:                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  .env.example          ──copy──►    .env               │
│  (template)                         (EDIT THIS!)       │
│  DON'T EDIT                         ✏️ Add your:        │
│                                     • API_KEY          │
│                                     • BASE_API_URL     │
│                                     • BACKEND_PORT     │
│                                     • FRONTEND_PORT    │
│                                                         │
│  docker-compose        ──rename──►  docker-compose.yml │
│  .example.yml                       (DON'T EDIT!)      │
│  DON'T EDIT                         Just use as-is     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Configuration Flow

```
Step 1: Copy Template
┌──────────────┐
│.env.example  │
│ (provided)   │
└──────┬───────┘
       │ cp .env.example .env
       ▼
┌──────────────┐
│   .env       │
│ (your copy)  │
└──────┬───────┘
       │
       │ Edit this file!
       │ Add your settings
       ▼
┌──────────────────────────────────┐
│ .env (configured)                │
│                                  │
│ BASE_API_URL=https://...         │
│ API_KEY=abc123...                │
│ BACKEND_PORT=8000                │
│ FRONTEND_PORT=5173               │
└──────┬───────────────────────────┘
       │
       │ docker-compose reads these automatically
       ▼
┌──────────────────────────────────┐
│ docker-compose.yml               │
│ (reads from .env automatically)  │
│                                  │
│ YOU DON'T EDIT THIS FILE!        │
└──────────────────────────────────┘
```

## Where Do I Edit...?

| What You Want to Change | File to Edit | Setting Name |
|------------------------|--------------|--------------|
| **API URL** | `.env` | `BASE_API_URL` |
| **API Key/Token** | `.env` | `API_KEY` |
| **Backend Port** | `.env` | `BACKEND_PORT` |
| **Frontend Port** | `.env` | `FRONTEND_PORT` |
| **Admin Password** | `.env` | `DEFAULT_ADMIN_PASSWORD` |
| **JWT Secret** | `.env` | `SECRET_KEY` |
| **Database Type** | `.env` | `DATABASE_URL` |
| **CORS Origins** | `.env` | `CORS_ORIGINS` |
| **Anything else?** | `.env` | (it's all in .env!) |

## Common Mistakes

### ❌ WRONG - Editing docker-compose.yml

```yaml
# DON'T DO THIS:
# Editing docker-compose.yml directly
services:
  backend:
    environment:
      - BASE_API_URL=https://myurl.com  # ❌ Wrong!
      - API_KEY=abc123                  # ❌ Wrong!
    ports:
      - "9000:8000"                     # ❌ Wrong!
```

### ✅ CORRECT - Editing .env

```bash
# DO THIS:
# Edit .env file
BASE_API_URL=https://myurl.com  # ✅ Correct!
API_KEY=abc123                  # ✅ Correct!
BACKEND_PORT=9000               # ✅ Correct!
```

## Why This Way?

**Benefits of using .env:**
- ✅ One file for all settings
- ✅ Easy to understand
- ✅ No YAML syntax to worry about
- ✅ Can be kept private (not in git)
- ✅ Same .env works for development and production
- ✅ docker-compose.yml stays clean and standard

**If you edit docker-compose.yml:**
- ❌ Have to know YAML syntax
- ❌ Easy to break formatting
- ❌ Harder to update from git
- ❌ Might accidentally commit secrets
- ❌ More complicated than needed

## How Does .env Take Precedence?

**Good question!** Docker Compose reads `.env` and uses those values to **substitute variables** in `docker-compose.yml`.

### The Magic Syntax

In `docker-compose.yml`, we use this pattern:
```yaml
ports:
  - "${BACKEND_PORT:-8000}:8000"
```

This means:
- `${BACKEND_PORT}` - Read value from `.env` file
- `:-8000` - If not set in `.env`, use default `8000`

So the `.env` file **always wins** because the YAML file is designed to read from it!

### Example Flow

**Your .env file:**
```bash
BACKEND_PORT=9000
```

**docker-compose.yml has:**
```yaml
ports:
  - "${BACKEND_PORT:-8000}:8000"  # Variable substitution
```

**Docker Compose sees:**
1. Check `.env` for `BACKEND_PORT` → Found: `9000`
2. Substitute into YAML: `"9000:8000"`
3. Result: Port 9000 on host maps to port 8000 in container

### What If I Edit docker-compose.yml Directly?

**If you hardcode values** in docker-compose.yml (removing the `${}` syntax):
```yaml
ports:
  - "7000:8000"  # Hardcoded - BAD!
```

Then:
- ❌ `.env` file is ignored for this value
- ❌ You lose the flexibility
- ❌ Harder to maintain

**That's why we say: DON'T EDIT docker-compose.yml!**

Our docker-compose.yml is designed to read everything from `.env`. Keep it that way!

### Visual Explanation

```
┌─────────────────────────────────────────────────────────┐
│  How Docker Compose Reads Configuration                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step 1: Read .env file                                │
│  ┌──────────────────┐                                  │
│  │ BACKEND_PORT=9000│                                  │
│  │ API_KEY=abc123   │                                  │
│  └──────────────────┘                                  │
│           │                                             │
│           ▼                                             │
│  Step 2: Read docker-compose.yml                       │
│  ┌──────────────────────────────────┐                  │
│  │ ports:                           │                  │
│  │   - "${BACKEND_PORT:-8000}:8000" │ ← Variable here │
│  │ environment:                     │                  │
│  │   - API_KEY=${API_KEY}           │ ← Variable here │
│  └──────────────────────────────────┘                  │
│           │                                             │
│           ▼                                             │
│  Step 3: Substitute values from .env                   │
│  ┌──────────────────────────────────┐                  │
│  │ ports:                           │                  │
│  │   - "9000:8000"                  │ ← Value from .env│
│  │ environment:                     │                  │
│  │   - API_KEY=abc123               │ ← Value from .env│
│  └──────────────────────────────────┘                  │
│           │                                             │
│           ▼                                             │
│  Step 4: Start containers with these values            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Precedence Rules (Technical Details)

1. **Variables with `${VAR}` syntax**: `.env` value is used
2. **Variables with `${VAR:-default}` syntax**: `.env` value if set, otherwise default
3. **Hardcoded values** (no `${}`): That hardcoded value is used (can't be overridden)
4. **Environment variables** in your shell: Override `.env` values

**Our Setup:** We use `${VAR}` or `${VAR:-default}` everywhere, so **`.env` controls everything!**

### Can I Override .env Values?

**Yes, temporarily** using shell environment variables:

```bash
# Override for just this run
BACKEND_PORT=9000 docker-compose up -d

# This overrides what's in .env for this command only
```

But **don't do this!** It's confusing. Just edit `.env` instead.

### Summary

```
┌──────────────────────────────────────────────┐
│ Configuration Precedence in Our Setup       │
├──────────────────────────────────────────────┤
│                                              │
│  1. .env file        ← EDIT THIS (wins!)    │
│  2. Defaults in yml  ← Only if .env empty   │
│  3. Shell env vars   ← Don't use these      │
│                                              │
│  Our docker-compose.yml uses ${} syntax,    │
│  so .env ALWAYS controls the values!        │
│                                              │
└──────────────────────────────────────────────┘
```

### Real Examples from Our docker-compose.yml

Here's what's actually in the file (you don't edit this!):

```yaml
# Port mapping - reads from .env
ports:
  - "${BACKEND_PORT:-8000}:8000"
  # Means: Use BACKEND_PORT from .env, default to 8000 if not set

# Required variable - MUST be in .env
environment:
  - BASE_API_URL=${BASE_API_URL:?BASE_API_URL must be set in .env file}
  # The :? syntax makes it required - Docker fails if not in .env
  
  - API_KEY=${API_KEY:?API_KEY must be set in .env file}
  # Same here - required!
  
  - SECRET_KEY=${SECRET_KEY:-09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7}
  # Optional - has a default, but .env can override
  
  - CORS_ORIGINS=http://localhost:${FRONTEND_PORT:-5173}
  # Uses FRONTEND_PORT from .env in the middle of a string
```

**See all those `${}`?** That's why `.env` controls everything!

## Frequently Asked Questions

### Q: Does .env always take precedence over docker-compose.yml?

**A: Yes, in our setup!** Because we use `${VARIABLE}` syntax throughout docker-compose.yml, it reads from .env. If you were to remove the `${}` and hardcode values, those hardcoded values would win - but **don't do that!**

### Q: What if I want to temporarily override a value?

**A: Edit .env and restart:**
```bash
# Edit .env
notepad .env  # Change BACKEND_PORT=9000

# Restart to apply changes
docker-compose restart
```

Or use shell environment variables (temporary):
```bash
BACKEND_PORT=9000 docker-compose up -d
```

### Q: What's the difference between `${VAR}`, `${VAR:-default}`, and `${VAR:?error}`?

**A: Three types of variable substitution:**

- `${VAR}` - Use value from .env, empty if not set
- `${VAR:-default}` - Use value from .env, use "default" if not set
- `${VAR:?error}` - Use value from .env, **fail with error** if not set

**Examples in our docker-compose.yml:**
```yaml
${BACKEND_PORT:-8000}           # Optional, defaults to 8000
${API_KEY:?Must be set}         # Required, fails if missing
${CORS_ORIGINS}                 # Optional, empty if not set
```

### Q: Can I use environment variables instead of .env file?

**A: Yes, but .env is easier!**

```bash
# This works but is annoying:
export BASE_API_URL=https://myurl.com
export API_KEY=abc123
export BACKEND_PORT=9000
docker-compose up -d

# This is better - just use .env!
# All values in one file, easy to manage
```

### Q: What if I have both .env and shell environment variables?

**A: Shell environment variables override .env:**

```bash
# .env file has:
BACKEND_PORT=8000

# You run:
BACKEND_PORT=9000 docker-compose up -d

# Result: Uses 9000 (shell variable wins)
```

**But this is confusing - stick to .env!**

### Q: Do I need to restart Docker after changing .env?

**A: Yes, for most changes:**

```bash
# After editing .env:
docker-compose restart

# Or for a full restart:
docker-compose down
docker-compose up -d
```

### Q: What happens if I forget a required variable?

**A: Docker Compose fails with a clear error:**

```bash
$ docker-compose up -d
ERROR: The BASE_API_URL must be set in .env file
```

This is intentional - prevents running with missing credentials!

### Q: Can I have multiple .env files for different environments?

**A: Yes! Rename them:**

```bash
# Different environments
.env.dev
.env.staging
.env.production

# Use specific one:
cp .env.production .env
docker-compose up -d

# Or specify directly:
docker-compose --env-file .env.production up -d
```

### Q: Should I commit .env to git?

**A: NO! Never!**

The `.env` file contains secrets (API keys, passwords). It's already in `.gitignore`.

**Do commit:** `.env.example` (template without secrets)  
**Don't commit:** `.env` (your actual configuration)

---

## Still Confused?

**Remember this simple rule:**

```
┌─────────────────────────────────────┐
│  Edit .env = Changes take effect    │
│  Edit docker-compose.yml = Don't!   │
└─────────────────────────────────────┘
```

The docker-compose.yml is designed to read from .env automatically. Just trust the system and edit .env!

## Step-by-Step Example

### 1. Start with Templates

You have these files (don't touch them yet):
```
esop-silverpeak-program/
├── .env.example              ← Template (provided)
└── docker-compose.example.yml ← Template (provided)
```

### 2. Copy .env Template

```bash
cp .env.example .env
```

Now you have:
```
esop-silverpeak-program/
├── .env.example              ← Template (keep as reference)
├── .env                      ← YOUR FILE (edit this)
└── docker-compose.example.yml ← Template (don't edit)
```

### 3. Edit .env (This is the ONLY file you edit)

```bash
# Windows
notepad .env

# Linux
nano .env
```

Change these values:
```bash
BASE_API_URL=https://YOUR-SILVERPEAK-URL.com/api/v1
API_KEY=YOUR_ACTUAL_TOKEN_HERE
BACKEND_PORT=8000    # or whatever port you want
FRONTEND_PORT=5173   # or whatever port you want
```

Save and close.

### 4. Rename docker-compose.example.yml (Don't Edit It!)

```bash
# Windows
move docker-compose.example.yml docker-compose.yml

# Linux
mv docker-compose.example.yml docker-compose.yml
```

Now you have:
```
esop-silverpeak-program/
├── .env.example              ← Template
├── .env                      ← YOUR SETTINGS (edited)
└── docker-compose.yml        ← Ready to use (not edited)
```

### 5. Start Docker

```bash
docker-compose up -d
```

Docker automatically:
- Reads settings from `.env`
- Applies them to `docker-compose.yml`
- Starts containers with your configuration

## Need to Change Something Later?

**Just edit `.env` and restart:**

```bash
# Edit .env
notepad .env  # or nano .env

# Restart Docker
docker-compose restart
```

That's it! No need to touch any other files.

## Quick Reference Card

```
┌──────────────────────────────────────────┐
│ Configuration Quick Reference            │
├──────────────────────────────────────────┤
│                                          │
│ Question: Where do I configure ports?    │
│ Answer:   Edit .env file                 │
│                                          │
│ Question: Where do I add API keys?       │
│ Answer:   Edit .env file                 │
│                                          │
│ Question: Should I edit docker-compose?  │
│ Answer:   NO! Never!                     │
│                                          │
│ Question: What if I want custom settings?│
│ Answer:   Edit .env file                 │
│                                          │
│ Rule: Everything goes in .env!           │
│                                          │
└──────────────────────────────────────────┘
```

## File Checklist

Before running `docker-compose up -d`:

- [ ] Created `.env` from `.env.example`
- [ ] Edited `.env` with your settings
- [ ] Renamed `docker-compose.example.yml` to `docker-compose.yml`
- [ ] Did NOT edit `docker-compose.yml`
- [ ] All settings are in `.env` file

If all checked, you're ready to run!

---

**Remember: `.env` is the ONLY file you edit. Everything else is automatic!**
