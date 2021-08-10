import PouchDB from "pouchdb";
import upsert from "pouchdb-upsert";

export const specialFormatting = (x) =>
  x
    .toLowerCase()
    .replace(/[^a-zA-Z,']+/g, " ")
    .replaceAll("_", " ")
    .replaceAll("  ", " ")
    .split(" ")
    .map((word) => {
      var end = word.substring(1);
      if (word.includes("'")) {
        var withapos = word.lastIndexOf("'");
        var beginning = word.substring(1, withapos);
        if (beginning.length === 1) {
          end =
            beginning +
            "'" +
            word.charAt(withapos + 1).toUpperCase() +
            word.substring(withapos + 2);
        }
      }
      return word.charAt(0).toUpperCase() + end;
    })
    .map((word) =>
      ["Of", "And", "The"].includes(word) ? word.toLowerCase() : word
    )
    .join(" ");

export class CDB {
  constructor(name) {
    PouchDB.plugin(upsert);
    this.db = new PouchDB("meCountry", {
      revs_limit: 1,
      auto_compaction: true
    });
  }
  async readCountry() {
    let allInfo = await this.db
      .allDocs({ include_docs: true })
      .catch((err) => console.log(err.message));
    let notes = {};
    allInfo && allInfo.rows.forEach((n) => (notes[n.doc._id] = n.doc));

    return notes;
  }

  async setCountry(c) {
    if (!c._id) {
      window.alert("pouchdb needs ._id key:value");
      this.db.destroy();
    } else {
      var res = await this.db.upsert(c._id, (doc) => {
        doc = { ...c };
        return doc;
      });
      return res;
    }
  }

  deleteKeys() {
    this.db.destroy();
  }
}

export default class TDB {
  constructor(name) {
    this.db = new PouchDB("DwollaToken", {
      revs_limit: 1,
      auto_compaction: true
    });
  }
  async readKey() {
    let allNotes = await this.db.allDocs({ include_docs: true });
    let notes = {};

    allNotes.rows.forEach((n) => (notes[n.doc.key] = n.doc));

    return notes;
  }

  async setKey(key) {
    console.log("setting key in pouchdb");
    const res = await this.db.post({ key });
    return res;
  }

  async deleteKeys() {
    console.log("deleting cached tokens.....");
    await this.db.destroy().then((x) => {
      this.db = new PouchDB("DwollaToken", {
        revs_limit: 1,
        auto_compaction: true
      });
    });
  }
}

export const stateCity = [
  {
    name: "Alabama",
    abbreviation: "AL"
  },
  {
    name: "Alaska",
    abbreviation: "AK"
  },
  {
    name: "American Samoa",
    abbreviation: "AS"
  },
  {
    name: "Arizona",
    abbreviation: "AZ"
  },
  {
    name: "Arkansas",
    abbreviation: "AR"
  },
  {
    name: "California",
    abbreviation: "CA"
  },
  {
    name: "Colorado",
    abbreviation: "CO"
  },
  {
    name: "Connecticut",
    abbreviation: "CT"
  },
  {
    name: "Delaware",
    abbreviation: "DE"
  },
  {
    name: "District Of Columbia",
    abbreviation: "DC"
  },
  {
    name: "Federated States Of Micronesia",
    abbreviation: "FM"
  },
  {
    name: "Florida",
    abbreviation: "FL"
  },
  {
    name: "Georgia",
    abbreviation: "GA"
  },
  {
    name: "Guam",
    abbreviation: "GU"
  },
  {
    name: "Hawaii",
    abbreviation: "HI"
  },
  {
    name: "Idaho",
    abbreviation: "ID"
  },
  {
    name: "Illinois",
    abbreviation: "IL"
  },
  {
    name: "Indiana",
    abbreviation: "IN"
  },
  {
    name: "Iowa",
    abbreviation: "IA"
  },
  {
    name: "Kansas",
    abbreviation: "KS"
  },
  {
    name: "Kentucky",
    abbreviation: "KY"
  },
  {
    name: "Louisiana",
    abbreviation: "LA"
  },
  {
    name: "Maine",
    abbreviation: "ME"
  },
  {
    name: "Marshall Islands",
    abbreviation: "MH"
  },
  {
    name: "Maryland",
    abbreviation: "MD"
  },
  {
    name: "Massachusetts",
    abbreviation: "MA"
  },
  {
    name: "Michigan",
    abbreviation: "MI"
  },
  {
    name: "Minnesota",
    abbreviation: "MN"
  },
  {
    name: "Mississippi",
    abbreviation: "MS"
  },
  {
    name: "Missouri",
    abbreviation: "MO"
  },
  {
    name: "Montana",
    abbreviation: "MT"
  },
  {
    name: "Nebraska",
    abbreviation: "NE"
  },
  {
    name: "Nevada",
    abbreviation: "NV"
  },
  {
    name: "New Hampshire",
    abbreviation: "NH"
  },
  {
    name: "New Jersey",
    abbreviation: "NJ"
  },
  {
    name: "New Mexico",
    abbreviation: "NM"
  },
  {
    name: "New York",
    abbreviation: "NY"
  },
  {
    name: "North Carolina",
    abbreviation: "NC"
  },
  {
    name: "North Dakota",
    abbreviation: "ND"
  },
  {
    name: "Northern Mariana Islands",
    abbreviation: "MP"
  },
  {
    name: "Ohio",
    abbreviation: "OH"
  },
  {
    name: "Oklahoma",
    abbreviation: "OK"
  },
  {
    name: "Oregon",
    abbreviation: "OR"
  },
  {
    name: "Palau",
    abbreviation: "PW"
  },
  {
    name: "Pennsylvania",
    abbreviation: "PA"
  },
  {
    name: "Puerto Rico",
    abbreviation: "PR"
  },
  {
    name: "Rhode Island",
    abbreviation: "RI"
  },
  {
    name: "South Carolina",
    abbreviation: "SC"
  },
  {
    name: "South Dakota",
    abbreviation: "SD"
  },
  {
    name: "Tennessee",
    abbreviation: "TN"
  },
  {
    name: "Texas",
    abbreviation: "TX"
  },
  {
    name: "Utah",
    abbreviation: "UT"
  },
  {
    name: "Vermont",
    abbreviation: "VT"
  },
  {
    name: "Virgin Islands",
    abbreviation: "VI"
  },
  {
    name: "Virginia",
    abbreviation: "VA"
  },
  {
    name: "Washington",
    abbreviation: "WA"
  },
  {
    name: "West Virginia",
    abbreviation: "WV"
  },
  {
    name: "Wisconsin",
    abbreviation: "WI"
  },
  {
    name: "Wyoming",
    abbreviation: "WY"
  }
];

export const suggestions = [
  {
    center: [35.5951, -82.5515],
    place_name: "Asheville, North Carolina, United States"
  },
  {
    center: [33.749, -84.388],
    place_name: "Atlanta, Georgia, United States"
  },
  {
    center: [39.3643, -74.4229],
    place_name: "Atlantic City, New Jersey, United States"
  },
  {
    center: [30.2672, -97.7431],
    place_name: "Austin, Texas, United States"
  },
  {
    center: [39.2904, -76.6122],
    place_name: "Baltimore, Maryland, United States"
  },
  {
    center: [42.3601, -71.0589],
    place_name: "Boston, Massachusetts, United States"
  },
  {
    center: [42.8864, -78.8784],
    place_name: "Buffalo, New York, United States"
  },
  {
    center: [51.0447, -114.0719],
    place_name: "Calgary, Alberta, Canada"
  },
  {
    center: [35.2271, -80.8431],
    place_name: "Charlotte, North Carolina, United States"
  },
  {
    center: [41.8781, -87.6298],
    place_name: "Chicago, Illinois, United States"
  },
  {
    center: [41.4993, -81.6944],
    place_name: "Cleveland, Ohio, United States"
  },
  {
    center: [39.9612, -82.9988],
    place_name: "Columbus, Ohio, United States"
  },
  {
    center: [33.6638, -117.9047],
    place_name: "Costa Mesa, California, United States"
  },
  {
    center: [32.7767, -96.797],
    place_name: "Dallas, Texas, United States"
  },
  {
    center: [39.7392, -104.9903],
    place_name: "Denver, Colorado, United States"
  },
  {
    center: [42.3314, -83.0458],
    place_name: "Detroit, Michigan, United States"
  },
  {
    center: [53.5461, -113.4938],
    place_name: "Edmonton, Alberta, Canada"
  },
  {
    center: [31.7619, -106.485],
    place_name: "El Paso, Texas, United States"
  },
  {
    center: [44.0521, -123.0868],
    place_name: "Eugene, Oregon, United States"
  },
  {
    center: [42.9634, -85.6681],
    place_name: "Grand Rapids, Michigan, United States"
  },
  {
    center: [29.7604, -95.3698],
    place_name: "Houston, Texas, United States"
  },
  {
    center: [39.0997, -94.5786],
    place_name: "Kansas City, Missouri, United States"
  },
  {
    center: [36.1699, -115.1398],
    place_name: "Las Vegas, Nevada, United States"
  },
  {
    center: [43.0731, -89.4012],
    place_name: "Madison, Wisconsin, United States"
  },
  {
    center: [25.7617, -80.1918],
    place_name: "Miami, Florida, United States"
  },
  {
    center: [43.0389, -87.9065],
    place_name: "Milwaukee, Wisconsin, United States"
  },
  {
    center: [44.9778, -93.265],
    place_name: "Minneapolis, Minnesota, United States"
  },
  {
    center: [45.5017, -73.5673],
    place_name: "Montreal, Quebec, Canada"
  },
  {
    center: [36.1627, -86.7816],
    place_name: "Nashville, Tennessee, United States"
  },
  {
    center: [29.9511, -90.0715],
    place_name: "New Orleans, Louisiana, United States"
  },
  {
    center: [28.5383, -81.3792],
    place_name: "Orlando, Florida, United States"
  },
  {
    center: [45.4215, -75.6972],
    place_name: "Ottawa, Ontario, United States"
  },
  {
    center: [39.9526, -75.1652],
    place_name: "Philadelphia, Pennsylvania, United States"
  },
  {
    center: [33.4484, -112.074],
    place_name: "Phoenix, Arizona, United States"
  },
  {
    center: [40.4406, -79.9959],
    place_name: "Pittsburgh, Pennsylvania, United States"
  },
  {
    center: [45.5051, -122.675],
    place_name: "Portland, Oregon, United States"
  },
  {
    center: [39.5296, -119.8138],
    place_name: "Reno, Nevada, United States"
  },
  {
    center: [37.5407, -77.436],
    place_name: "Richmond, Virgina, United States"
  },
  {
    center: [38.5816, -121.4944],
    place_name: "Sacremento, Califoria, United States"
  },
  {
    center: [38.627, -90.1994],
    place_name: "Saint Louis, Missouri, United States"
  },
  {
    center: [40.7608, -111.891],
    place_name: "Salt Lake City, Utah, United States"
  },
  {
    center: [32.7157, -117.1611],
    place_name: "San Diego, California, United States"
  },
  {
    center: [37.7749, -122.4194],
    place_name: "San Francisco, California, United States"
  },
  {
    center: [34.4208, -119.6982],
    place_name: "Santa Barbara, California, United States"
  },
  {
    center: [47.6062, -122.3321],
    place_name: "Seattle, Washington, United States"
  },
  {
    center: [27.9506, -82.4572],
    place_name: "Tampa, Florida, United States"
  },
  {
    center: [43.6532, -79.3832],
    place_name: "Toronto, Ontario, Canada"
  },
  {
    center: [49.2827, -123.1207],
    place_name: "Vancouver, British Columbia, Canada"
  },
  {
    center: [38.9072, -77.0369],
    place_name: "Washington, District of Columbia, United States"
  }
];
