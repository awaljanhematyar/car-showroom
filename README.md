# Jan Motor Showroom

Functional frontend demo using HTML5, CSS3, Vanilla JavaScript and localStorage.

## Updated features

- Admin-only login screen
- Demo credentials: admin / admin123
- Cars inventory
- Simple Add Car form with important fields only
- Multiple car image upload with preview, remove, compression and localStorage persistence
- Edit car and manage existing/new images
- Car details gallery
- Car notes / یادښت
- Sell and delete car actions
- Repair management
- Add, edit and delete repairs
- Repair notes and direct repair entry while adding a car
- Expenses management
- Search and filters for cars and expenses
- Reports with date ranges
- No Sales vs Expenses chart
- No Expense Categories chart
- Dashboard with repair costs included in profit/loss
- Settings and theme
- Toasts and confirmation modals
- Responsive desktop, tablet and mobile layout

## Important

This remains a frontend demonstration. The admin login is simulated with localStorage and is not real security. Images are compressed and stored in browser localStorage, so very large image collections can reach the browser storage limit.

Open index.html in a browser.


## Run locally

```sh
git clone https://github.com/awaljanhematyar/car-showroom.git
cd car-showroom
```

Serve the folder with VS Code Live Server and open `index.html`. No dependency installation or build step is required. A local HTTP origin keeps browser storage predictable.

## Source map

| Path | Responsibility |
| --- | --- |
| `index.html` | Application interface |
| `style.css` | Layout and visual styles |
| `js/app.js` | Application interactions |
| `js/data.js` | Application data module |
| `js/storage.js` | Local record persistence and simulated session flag |
| `js/navigation.js` | View navigation |
| `js/modal.js`, `js/toast.js` | Dialog and feedback helpers |

Stored records are local to one browser and origin. Clearing site storage removes them. The demo login does not protect private records. Use sample data.

## Related project

[jan-motor-showroom](https://github.com/awaljanhematyar/jan-motor-showroom) contains a separate multi-page implementation.

## Author

[Awal Jan Hematyar](https://github.com/awaljanhematyar) · [Developer portfolio](https://hematyar-professional-portfolio.vercel.app/)
