# [RinHaсk 2023 Hackathon](https://rsue.ru/universitet/novosti/novosti.php?ELEMENT_ID=109316)

## 🏅 The HelloWorld team took third place

![hackathon](/details/cert_rinhack.jpg)

## 📜 Description

In the modern IT industry, the problem of employee burnout is becoming one of the most urgent. It is difficult to identify burnout on your own, because the awareness of the need for rest comes too late. This condition carries serious health risks. An employee who has experienced burnout usually loses not only productivity, but can also become a catalyst for toxic behavior in the team. In this regard, it is necessary to think about ways to identify this condition and take preventive measures.

A system has been implemented that will be available to the company's managers, it is assumed that access will be granted at the network level. How the system works:

- New data on employee activity for the previous day is added daily at 00:00.
- A set of criteria determines that an employee is prone to burnout.
- Through an HTTP request, information is transmitted to the frontend (Yandex Data Lens / Web) and a diagram is formed.

## Swagger

https://probable-enigma-production.up.railway.app/docs/api

## Architecture

<img src="https://i.imgur.com/HWR1ucb.jpg" alt="Arch" />

## Database

<img src="https://i.imgur.com/jp6k267.png" alt="DB" />
<img src="https://i.imgur.com/Kt3l9h0.png" alt="DB" />

## Install and start

```bash
$ yarn install

# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

![hackathon](/details/rinhack.jpg)
