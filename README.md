# Suparsale Store Ltd Business Control System

Premium one-shop business control system for Suparsale Store Ltd.

Suparsale Store Ltd sells electronics and home appliances such as smart TVs, digital TVs, big and small TVs, fridges, irons, washing machines, fans, bicycles, electronics accessories, and related materials.

## What the system controls

- Products and inventory
- Stock arrivals, stock counts, damaged stock, missing stock, and low-stock alerts
- Sales and sale details
- Customer debts and debt payments
- Cash, MoMo, bank, card, and other payment methods
- Expenses and owner approval
- Daily money movement
- Owner/staff access control
- Date and time filtered reports
- Downloadable PDF reports

## Access model

- Owner: full access to every module.
- Limited staff member: daily access for selling, payments, customers, stock, and assigned product work. No settings, staff management, or owner-only control.

## Seed environment

Required:

```env
OWNER_EMAIL=owner@suparsalestore.rw
OWNER_PASSWORD=change-this-password
OWNER_NAME=Suparsale Owner
```

Optional limited staff account:

```env
STAFF_EMAIL=staff@suparsalestore.rw
STAFF_PASSWORD=change-this-password
STAFF_NAME=Suparsale Staff
```

Running the seed creates Suparsale electronics categories including Smart TVs, Digital TVs, Big TVs, Small TVs, Fridges, Irons, Washing Machines, Fans, Bicycles, Electronics Accessories, Home Appliances, and Other Electronics Materials.
