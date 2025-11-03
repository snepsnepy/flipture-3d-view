# 📊 Vizitatori Unici per Flipbook în Google Analytics 4

## ✅ Ce am implementat:

Toate evenimentele trimite acum **`flipbook_id`** ca parametru custom, astfel:

- ✅ `flipbook_view` → `flipbook_id`, `flipbook_title`
- ✅ `page_flip` → `flipbook_id`, `page_number`
- ✅ `zoom_in/out/reset` → `flipbook_id`, `zoom_level`
- ✅ `engagement_time` → `flipbook_id`, `time_seconds`

---

## 🎯 Cum să vezi vizitatori unici per flipbook în GA4

### **Opțiunea 1: Realtime (Live)**

1. Du-te la [Google Analytics](https://analytics.google.com/)
2. **Reports → Realtime**
3. Scroll down la **Event count by Event name**
4. Click pe `flipbook_view`
5. Vezi parametrul `flipbook_id` și numărul de utilizatori activi pentru fiecare

---

### **Opțiunea 2: Engagement Reports (Recomandat)**

#### **Pasul 1: Mergi la Events**
1. **Reports → Engagement → Events**
2. Găsește evenimentul `flipbook_view`
3. Click pe numele evenimentului

#### **Pasul 2: Adaugă dimensiune custom**
1. Click pe **butonul "+"** lângă "Dimensions"
2. Selectează **"Event parameters"**
3. Caută și selectează **`flipbook_id`**
4. Click **"Apply"**

#### **Pasul 3: Vezi vizitatori unici**
Acum vezi:
- **Event count** = Total vizualizări per flipbook
- **Total users** = **Vizitatori unici** per flipbook ✅

---

### **Opțiunea 3: Custom Report (Explorer)**

#### **Creează un raport personalizat pentru toate flipbook-urile tale:**

1. **Explore → Free form**
2. **Variables:**
   - **Dimensions:** Adaugă `Event name`, `Event parameter: flipbook_id`
   - **Metrics:** Adaugă `Total users`, `Event count`, `Average engagement time`
3. **Settings:**
   - **Rows:** `Event parameter: flipbook_id`
   - **Values:** `Total users`, `Event count`
   - **Filters:** `Event name` = `flipbook_view`
4. Click **"Apply"**

**Rezultat:** Tabel cu vizitatori unici pentru fiecare flipbook! 🎉

---

## 📊 Exemple de query-uri utile

### **1. Top Flipbooks (by unique visitors)**

**Explorer setup:**
- **Dimension:** `flipbook_id`
- **Metric:** `Total users` (descending)
- **Filter:** `Event name` = `flipbook_view`

### **2. Flipbook engagement per device**

**Explorer setup:**
- **Dimensions:** `flipbook_id`, `Device category`
- **Metrics:** `Total users`, `Average engagement time`
- **Filter:** `Event name` = `flipbook_view`

### **3. Geographic distribution per flipbook**

**Explorer setup:**
- **Dimensions:** `flipbook_id`, `Country`
- **Metrics:** `Total users`
- **Filter:** `Event name` = `flipbook_view`

### **4. Page views per flipbook**

**Explorer setup:**
- **Dimension:** `flipbook_id`
- **Metric:** `Event count`
- **Filter:** `Event name` = `page_flip`

---

## 🎨 Dashboard pentru Flipture (Nuxt)

### **Opțiunea 1: Google Analytics Data API**

Pentru a afișa vizitatori unici în dashboard-ul tău Nuxt:

```bash
npm install @google-analytics/data
```

**API Route în Nuxt (`server/api/analytics/[flipbookId].ts`):**

```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export default defineEventHandler(async (event) => {
  const flipbookId = event.context.params?.flipbookId;
  
  const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA_CLIENT_EMAIL,
      private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
  });

  const propertyId = process.env.GA_PROPERTY_ID;

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'eventName' },
      ],
      metrics: [
        { name: 'totalUsers' }, // VIZITATORI UNICI
        { name: 'eventCount' },
        { name: 'averageSessionDuration' },
      ],
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: 'eventName',
                stringFilter: {
                  value: 'flipbook_view',
                },
              },
            },
            {
              filter: {
                fieldName: 'customEvent:flipbook_id',
                stringFilter: {
                  value: flipbookId,
                },
              },
            },
          ],
        },
      },
    });

    const row = response.rows?.[0];
    
    return {
      uniqueVisitors: parseInt(row?.metricValues?.[0]?.value || '0'),
      totalViews: parseInt(row?.metricValues?.[1]?.value || '0'),
      avgDuration: parseFloat(row?.metricValues?.[2]?.value || '0'),
    };
  } catch (error) {
    console.error('GA4 API Error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch analytics',
    });
  }
});
```

**Folosește în componenta Nuxt:**

```vue
<script setup lang="ts">
const flipbookId = route.params.id;

const { data: analytics, pending } = await useFetch(`/api/analytics/${flipbookId}`);
</script>

<template>
  <div class="analytics-card">
    <div v-if="pending">Loading...</div>
    <div v-else>
      <div class="stat">
        <h3>Unique Visitors</h3>
        <p class="big-number">{{ analytics?.uniqueVisitors }}</p>
      </div>
      <div class="stat">
        <h3>Total Views</h3>
        <p class="big-number">{{ analytics?.totalViews }}</p>
      </div>
      <div class="stat">
        <h3>Avg. Duration</h3>
        <p class="big-number">{{ Math.round(analytics?.avgDuration) }}s</p>
      </div>
    </div>
  </div>
</template>
```

---

### **Opțiunea 2: Link direct către GA4 filtrat**

```vue
<template>
  <NuxtLink 
    :to="gaFilteredUrl" 
    target="_blank"
    class="view-analytics-btn"
  >
    📊 View Analytics for this Flipbook
  </NuxtLink>
</template>

<script setup>
const flipbookId = route.params.id;
const gaPropertyId = useRuntimeConfig().public.gaPropertyId;

// Link direct către GA4 filtrat după flipbook_id
const gaFilteredUrl = computed(() => 
  `https://analytics.google.com/analytics/web/#/p${gaPropertyId}/reports/explorer`
);
</script>
```

---

## 📋 Setup pentru Google Analytics Data API

### **1. Creează Service Account:**

1. Du-te la [Google Cloud Console](https://console.cloud.google.com/)
2. Creează un nou proiect (sau selectează unul existent)
3. Activează **Google Analytics Data API**
4. **IAM & Admin → Service Accounts → Create Service Account**
5. Descarcă JSON key

### **2. Adaugă Service Account în GA4:**

1. Du-te la GA4 → **Admin**
2. **Property → Property Access Management**
3. Click **"+"** → **Add users**
4. Adaugă email-ul Service Account (din JSON)
5. Role: **Viewer**

### **3. Configurează în Nuxt (.env):**

```env
# Google Analytics Data API
GA_PROPERTY_ID=123456789
GA_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 🎯 Query pentru TOATE flipbook-urile

Pentru a vedea vizitatori unici pentru toate flipbook-urile dintr-o dată:

**API Route (`server/api/analytics/all.ts`):**

```typescript
const [response] = await analyticsDataClient.runReport({
  property: `properties/${propertyId}`,
  dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
  dimensions: [
    { name: 'customEvent:flipbook_id' },
  ],
  metrics: [
    { name: 'totalUsers' },
    { name: 'eventCount' },
  ],
  dimensionFilter: {
    filter: {
      fieldName: 'eventName',
      stringFilter: { value: 'flipbook_view' },
    },
  },
  orderBys: [
    {
      metric: { metricName: 'totalUsers' },
      desc: true,
    },
  ],
});

// Procesează răspunsul
const flipbooks = response.rows?.map(row => ({
  flipbookId: row.dimensionValues?.[0]?.value,
  uniqueVisitors: parseInt(row.metricValues?.[0]?.value || '0'),
  totalViews: parseInt(row.metricValues?.[1]?.value || '0'),
})) || [];

return flipbooks;
```

**Rezultat:**
```json
[
  {
    "flipbookId": "abc-123",
    "uniqueVisitors": 45,
    "totalViews": 123
  },
  {
    "flipbookId": "def-456",
    "uniqueVisitors": 32,
    "totalViews": 89
  }
]
```

---

## 🔍 Verificare rapidă

### **Test manual în GA4:**

1. **Reports → Engagement → Events**
2. Click pe `flipbook_view`
3. Click pe **"View event parameter flipbook_id"**
4. Vezi lista cu toate flipbook-urile și câți utilizatori unici au fiecare ✅

---

## 📊 Vizualizare recomandată în Flipture Dashboard

```vue
<template>
  <div class="flipbooks-analytics">
    <h2>Flipbooks Performance</h2>
    
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Flipbook Title</th>
            <th>Unique Visitors</th>
            <th>Total Views</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="flipbook in flipbooksWithAnalytics" :key="flipbook.id">
            <td>{{ flipbook.title }}</td>
            <td class="highlight">{{ flipbook.uniqueVisitors }}</td>
            <td>{{ flipbook.totalViews }}</td>
            <td>
              <NuxtLink :to="`/analytics/${flipbook.id}`">
                View Details
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
```

---

## 🎉 Concluzie

Acum ai **tracking complet per flipbook**! 

✅ Fiecare eveniment include `flipbook_id`  
✅ Poți vedea vizitatori unici pentru fiecare flipbook în GA4  
✅ Poți integra datele în dashboard-ul Nuxt cu GA Data API  
✅ Poți compara performance între flipbook-uri  

**Tot ce trebuie să faci:**
1. Testează în aplicație
2. Vezi datele în GA4 → Events → `flipbook_view`
3. (Opțional) Integrează GA Data API în Nuxt pentru dashboard custom

---

**Happy tracking! 📊🚀**

