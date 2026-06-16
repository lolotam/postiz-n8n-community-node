# Introduction
[Postora](https://postiz.walidmohamed.com) is a powerful social media scheduling tool that allows you to manage your social media accounts efficiently.

You can use n8n to automate your workflow and post to multiple social media platforms at once.
For example: Load news from Reddit >> Make it a video with AI >> Post it to your social media accounts.

---

> Note
> Postora is self-hosted behind a reverse proxy. The host must end with `/api`, for example:
> `https://postiz.walidmohamed.com/api`

---

## Installation (quick installation)

- Click on settings
- Click on Community Nodes
- Click on Install
- Add "n8n-nodes-postora" to "npm Package Name"
- Click on Install

---

## Installation (non-docker - manual installation)
Go to your n8n installation usually located at `~/.n8n`.
Check if you have the `custom` folder, if not create it and create a new package.json file inside.
```bash
mkdir -p ~/.n8n/custom
npm init -y
```

Then install the Postora node package:
```
npm install n8n-nodes-postora
```

## For docker users (manual installation)
Create a new folder on your host machine, for example `~/n8n-custom-nodes`, and create a new package.json file inside:
```bash
mkdir -p ~/n8n-custom-nodes
npm init -y
```

install the Postora node package:
```bash
npm install n8n-nodes-postora
```

When you run the n8n docker container, mount the custom nodes folder to the container:
Add the following environment variable to your docker run command:
```
N8N_CUSTOM_EXTENSIONS="~/n8n-custom-nodes"
```

## Credential setup
When creating the **Postora API** credential in n8n:

- **Host**: `https://postiz.walidmohamed.com/api`
- **API Key**: your Postora organization API key

The node appends `/public/v1` to the host automatically, so requests are sent to:
`https://postiz.walidmohamed.com/api/public/v1/*`
