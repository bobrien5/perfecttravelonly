# GHL Hidden Field — Deal Page → Destination Map

For each deal page, paste the matching `Destination` string into the hidden `destination` field of the GHL form embed on that page. WOW receives this in the lead alert email.

## All-Inclusive (6)

| URL | Destination value (paste this) |
|---|---|
| /deals/all-inclusive/montego-bay-jamaica-all-inclusive-3-nights-flights-for-two | `Montego Bay, Jamaica` |
| /deals/all-inclusive/punta-cana-all-inclusive-3-nights-flights-for-two | `Punta Cana, Dominican Republic` |
| /deals/all-inclusive/puerto-plata-all-inclusive-3-nights-flights-for-two | `Puerto Plata, Dominican Republic` |
| /deals/all-inclusive/cancun-all-inclusive-3-nights-flights-for-two | `Cancun, Mexico` |
| /deals/all-inclusive/riviera-maya-all-inclusive-3-nights-flights-for-two | `Riviera Maya, Mexico` |
| /deals/all-inclusive/caribbean-all-inclusive-3-nights | `Caribbean All-Inclusive` |

## Adults-Only (1)

| URL | Destination value |
|---|---|
| /deals/adults-only/aruba-adults-only-tropical-getaway-3-nights | `Aruba (Adults-Only)` |

## Budget (1)

| URL | Destination value |
|---|---|
| /deals/budget/budget-punta-cana-5-nights | `Punta Cana, Dominican Republic (Budget)` |

## Timeshare (11)

| URL | Destination value |
|---|---|
| /deals/timeshare/smoky-mountains-tn-dollywood-mountain-views-southern-charm | `Smoky Mountains, TN` |
| /deals/timeshare/las-vegas-nv-entertainment-capital-of-the-world | `Las Vegas, NV` |
| /deals/timeshare/pocono-mountains-pa-mountain-escapes-year-round-adventure | `Pocono Mountains, PA` |
| /deals/timeshare/daytona-beach-fl-surf-speed-space-coast | `Daytona Beach, FL` |
| /deals/timeshare/orlando-fl-theme-parks-sunshine-endless-entertainment | `Orlando, FL` |
| /deals/timeshare/clearwater-beach-fl-sun-sand-gulf-coast-paradise | `Clearwater Beach, FL` |
| /deals/timeshare/williamsburg-va-history-adventure-colonial-charm | `Williamsburg, VA` |
| /deals/timeshare/myrtle-beach-sc-shopping-shows-beach-fun | `Myrtle Beach, SC` |
| /deals/timeshare/branson-mo-theme-parks-shows-family-fun | `Branson, MO` |
| /deals/timeshare/orlando-timeshare-preview-4-nights | `Orlando, FL (Timeshare Preview)` |
| /deals/timeshare/cancun-timeshare-preview-5-nights | `Cancun, Mexico (Timeshare Preview)` |

## Weekend Getaways (1)

| URL | Destination value |
|---|---|
| /deals/weekend-getaways/las-vegas-weekend-getaway-3-nights | `Las Vegas, NV (Weekend)` |

---

## How to apply in GHL (per page)

For each deal page above:
1. Open the deal page on the live site
2. Click the embedded GHL form → Edit form (or open in GHL Sites → Forms)
3. Find (or add) a hidden field named `destination`
4. Set its **default value** to the `Destination value` from the table above
5. Map the field to the custom contact field `Destination` in GHL
6. Save the form

After all 20 are configured, every lead alert to `tristarnetworkfl@gmail.com` will include the human-readable destination in the subject line and body — WOW reps know exactly what each lead was looking at before they call.

## Faster path if you have one global form

If all 20 pages embed the **same** GHL form, you can't hardcode 20 different destination values into one form. Instead, use the JS snippet from earlier to derive the destination from the page URL slug at submit time:

```html
<script>
  const map = {
    "montego-bay-jamaica-all-inclusive-3-nights-flights-for-two": "Montego Bay, Jamaica",
    "punta-cana-all-inclusive-3-nights-flights-for-two": "Punta Cana, Dominican Republic",
    "puerto-plata-all-inclusive-3-nights-flights-for-two": "Puerto Plata, Dominican Republic",
    "cancun-all-inclusive-3-nights-flights-for-two": "Cancun, Mexico",
    "riviera-maya-all-inclusive-3-nights-flights-for-two": "Riviera Maya, Mexico",
    "caribbean-all-inclusive-3-nights": "Caribbean All-Inclusive",
    "aruba-adults-only-tropical-getaway-3-nights": "Aruba (Adults-Only)",
    "budget-punta-cana-5-nights": "Punta Cana, Dominican Republic (Budget)",
    "smoky-mountains-tn-dollywood-mountain-views-southern-charm": "Smoky Mountains, TN",
    "las-vegas-nv-entertainment-capital-of-the-world": "Las Vegas, NV",
    "pocono-mountains-pa-mountain-escapes-year-round-adventure": "Pocono Mountains, PA",
    "daytona-beach-fl-surf-speed-space-coast": "Daytona Beach, FL",
    "orlando-fl-theme-parks-sunshine-endless-entertainment": "Orlando, FL",
    "clearwater-beach-fl-sun-sand-gulf-coast-paradise": "Clearwater Beach, FL",
    "williamsburg-va-history-adventure-colonial-charm": "Williamsburg, VA",
    "myrtle-beach-sc-shopping-shows-beach-fun": "Myrtle Beach, SC",
    "branson-mo-theme-parks-shows-family-fun": "Branson, MO",
    "orlando-timeshare-preview-4-nights": "Orlando, FL (Timeshare Preview)",
    "cancun-timeshare-preview-5-nights": "Cancun, Mexico (Timeshare Preview)",
    "las-vegas-weekend-getaway-3-nights": "Las Vegas, NV (Weekend)"
  };
  const slug = window.location.pathname.split('/').pop();
  const destination = map[slug] || "Unknown";
  // pass into form as ?destination=... via the iframe-src trick from earlier
  const formIframe = document.querySelector('iframe[src*="leadconnector"]');
  if (formIframe) {
    formIframe.src += (formIframe.src.includes('?') ? '&' : '?') +
      'destination=' + encodeURIComponent(destination);
  }
</script>
```

Drop that snippet into your global site layout (or as a `<Script>` in `app/layout.tsx`) and one form picks up the right destination on every page automatically.
