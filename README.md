# Subtitle extractor

Extract subtitles from folders and rename them for PotPlayer usage

Only moves English subs

# Setup

```
npm i
```

create `.env` with SHOW_PATH to your main directory of shows

# Usage

```
npm start [Split by season: yes/no] [insert folder name] 
```

# Extract all files to parent directory

Extracts all files in sub-folders to parent directory

Does not work on sub-sub-folders (Can run this multiple times)

```Note: Because this is slightly more dangerous, there will be a prompt required before execution```

```
npm run extractAll [Full path name]
```