# EC2 Setup Commands

## 1. SSH into EC2
```bash
ssh -i "neo-4j-2.pem" ec2-user@ec2-18-219-66-12.us-east-2.compute.amazonaws.com
```

## 2. Install Node.js
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js 18
nvm install 18
nvm use 18
```

## 3. Setup Project
```bash
cd suggestME/backend
npm install
```

## 4. Run Scripts
```bash
# Create and attach to a screen session
screen -S pop
# Run the script
node scripts/batch-2-pop-rnb.js
# Detach from screen: press Ctrl+A, then D
```

## 5. Managing Screens
```bash
# List all screens
screen -ls

# Reattach to a screen
screen -r pop

# Kill a screen if needed
screen -S [screen_name] -X quit
```

## Notes
- The scripts are now capped at 60-second rate limit delays
- Data is stored in AuraDB and persists even when EC2 is stopped
- Always check the script is running properly before detaching from screen