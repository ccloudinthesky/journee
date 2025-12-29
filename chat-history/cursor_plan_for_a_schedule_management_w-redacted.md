**User**

SimpleMap.tsx:110 Uncaught TypeError: Cannot read properties of undefined (reading 'AdvancedMarkerElement')
    at SimpleMap.tsx:110:45
    at Array.forEach (<anonymous>)
    at SimpleMap.tsx:90:15

Explore.tsx:209 An error occurred in the <SimpleMap> component.

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries.
VM621 js:1368 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'DJ')

---

**User**

現在看起來會同時出現兩種框框哈，然後自己定義的框框也沒有跟隨地標，會一直在中間顯示也是錯的

---

**User**

現在只可以點進去有儲存的～～
視窗也會固定在中間沒辦法移動

---

**User**

現在可以按非儲存的地方了，但一樣會出現兩個視窗。
然後自己定義的視窗應該要類似google map 的的視窗，會顯示在地圖上點選的地方的上面

---

**User**

現在反而沒有辦法按儲存的地標了，只剩下原生的googlemap功能

---

**User**

可以幫我列出負責點選地標顯示出資訊圖卡的這些程式碼嗎

---

**User**

我還發現一個問題是今天在explore裡面的某個行程中，如果刷新的話，頁面左側的預設行程頁面就會不見

---

**User**

還是會不見誒

---

**User**

那可以也跟前面的頁面一致，顯示loading your journeys 嗎

---

**User**

我現在會先出現loading, 在出現Loading your journeys

---

**User**

根據你描述的狀況：「
✅ 沒有儲存的地點可以點，會顯示原生 Google Maps 的彈窗
❌ 有儲存的地點點不動，原本自定義的資訊視窗（`LocationPopup`）不會出現」，
可以推斷出目前是 **事件綁定與原生 InfoWindow 阻止機制混在一起** 的問題。
### 🧭 問題根源分析

在你目前的架構中，應該有這兩種觸發方式：

| 類型          | 資料來源                                      | 預期動作                                    | 現況      |
| ----------- | ----------------------------------------- | --------------------------------------- | ------- |
| POI（原生地標）   | Google Maps event.placeId                 | 使用 Places API 取資料，再觸發 `onLocationClick` | ✅ 正常    |
| 自定義標記（儲存地點） | 由你在程式中建立的 `new google.maps.Marker({...})` | 綁定自定義 click 事件 → 顯示自製 `LocationPopup`   | ❌ 目前沒反應 |
### 🎯 主要可能原因

#### 1️⃣ `event.stop()` 或 `stopPropagation()` 沒有被正確呼叫

* 若 Google Maps 的全域 `map.click` 事件仍然攔截到了點擊，會導致你自己加的 marker click 沒有觸發。

🔧 **檢查點：**

```ts
marker.addListener('click', (event: google.maps.MapMouseEvent) => {
  event.stop(); // ✅ 一定要有這個
  event.domEvent?.stopPropagation(); // ✅ 再確保原生 DOM 事件不再往上傳
  if (onLocationClick) onLocationClick(location);
});
```
#### 2️⃣ 原生 InfoWindow 沒有完全被禁用

即使你有設定「全域 InfoWindow 阻止原生彈窗」，但若你在 `map.addListener('click', ...)` 時沒有 `preventDefault()` 或沒有 `return false`，Google 仍會嘗試打開原生泡泡。

🔧 **檢查點：**

```ts
newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
  if (event.placeId) {
    event.stop(); // ✅ 阻止氣泡
    event.domEvent?.stopPropagation();
    event.preventDefault?.(); // ✅ 防止預設 InfoWindow 顯示
    return false; // ✅ Google 官方文件推薦
  }
});
```
#### 3️⃣ 你的自定義地標 (`savedLocations`) 在初始化後沒有重新綁定事件

如果地圖初始化完後你才更新了 `savedLocations` 狀態，但 marker 沒重新渲染，就不會有 click listener。

🔧 **檢查點：**
確保在 `SimpleMap.tsx` 裡有這類效果：

```ts
useEffect(() => {
  if (map && savedLocations.length > 0) {
    savedLocations.forEach(location => {
      const marker = new google.maps.Marker({
        position: location.position,
        map,
        icon: customIcon,
      });
      marker.addListener('click', (event) => {
        event.stop();
        event.domEvent?.stopPropagation();
        onLocationClick?.(location);
      });
    });
  }
}, [map, savedLocations]);
```
### ✅ 建議修正方向

1. **統一處理入口**
   所有地點（POI / 自訂）都用同一個 `handleLocationClick` 顯示同樣的 `LocationPopup`，不分系統。

2. **確實阻止 Google Maps 原生 InfoWindow**
   在全域地圖 `click` 事件與 marker click 事件中都 `event.stop()`、`preventDefault()`。

3. **動態建立 marker 時即綁定事件**
   確保 useEffect 的依賴中包含 `savedLocations`，這樣更新後 marker 會重新渲染。

---

**User**

我現在變成所有地標按了都沒有反應？console出現了這個訊息
As of March 1st, 2025, google.maps.places.PlacesService is not available to new customers. Please use google.maps.places.Place instead. At this time, google.maps.places.PlacesService is not scheduled to be discontinued, but google.maps.places.Place is recommended over google.maps.places.PlacesService. While google.maps.places.PlacesService will continue to receive bug fixes for any major regressions, existing bugs in google.maps.places.PlacesService will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/legacy for additional details and https://developers.google.com/maps/documentation/javascript/places-migration-overview for the migration guide.
WE @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:566
(anonymous) @ SimpleMap.tsx:75
_.Kn @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1251
EXa @ onion.js:41
(anonymous) @ onion.js:39
(anonymous) @ onion.js:43
c @ VM42 common.js:107
(anonymous) @ ApplicationService.GetEntityDetails?pb=!1m2!1m1!4s1809499139808371885!2m2!1szh-TW!2sUS!6e1&callback=_xdc_._j3t5nh&key=AIza****cj1Y&token=72582:1Understand this warning
SimpleMap.tsx:80 Place details result: {place: {…}, status: 'OK'}
SimpleMap.tsx:95 POI clicked: {id: 'ChIJdzc78c_dQUcRrSSnaeGhHBk', name: 'Light Art Museum', address: 'Budapest, Hold u. 13, 1054 匈牙利', coordinates: {…}, type: 'attraction', …}
Explore.tsx:134 Location clicked: {id: 'ChIJdzc78c_dQUcRrSSnaeGhHBk', name: 'Light Art Museum', address: 'Budapest, Hold u. 13, 1054 匈牙利', coordinates: {…}, type: 'attraction', …}

---

**User**

那我不是應該要用新版的place 嗎？
js?key=AIza****REDACTED…=initGoogleMaps:566 As of March 1st, 2025, google.maps.places.PlacesService is not available to new customers. Please use google.maps.places.Place instead. At this time, google.maps.places.PlacesService is not scheduled to be discontinued, but google.maps.places.Place is recommended over google.maps.places.PlacesService. While google.maps.places.PlacesService will continue to receive bug fixes for any major regressions, existing bugs in google.maps.places.PlacesService will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/legacy for additional details and https://developers.google.com/maps/documentation/javascript/places-migration-overview for the migration guide.

SimpleMap.tsx:80 Place details result: 
{place: {…}, status: 'OK'}
SimpleMap.tsx:95 POI clicked: 
{id: 'ChIJAQquYc1v5kcRLKslDuENAxg', name: 'Place de la Concorde', address: '75008法國巴黎', coordinates: {…}, type: 'attraction', …}
Explore.tsx:134 Location clicked: 
{id: 'ChIJAQquYc1v5kcRLKslDuENAxg', name: 'Place de la Concorde', address: '75008法國巴黎', coordinates: {…}, type: 'attraction', …}

---

**User**

POI clicked, placeId: ChIJLeslLNhx5kcRtkpSU9ZmNvo
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1398  POST https://places.googleapis.com/$rpc/google.maps.places.v1.Places/GetPlace 403 (Forbidden)
_.z.send @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1398
eba @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1223
(anonymous) @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1421
(anonymous) @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1421
intercept @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1666
await in intercept
(anonymous) @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1222
Fg @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1422
Cg @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1422
google.maps.__gjsload__.$9.getPlace @ places_impl.js:60
Rvb @ places_impl.js:37
mra @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:215
await in mra
fetchFields @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:872
(anonymous) @ SimpleMap.tsx:82
_.Kn @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1251
EXa @ onion.js:41
(anonymous) @ onion.js:39
(anonymous) @ onion.js:43
c @ VM362 common.js:107
(anonymous) @ ApplicationService.GetEntityDetails?pb=!1m2!1m1!4s18029711228931295926!2m2!1szh-TW!2sUS!6e1&callback=_xdc_._u1cr0x&key=AIza****cj1Y&token=39001:1Understand this error
SimpleMap.tsx:106 Error fetching place details: MapsRequestError: PLACES_GET_PLACE: PERMISSION_DENIED: Error fetching fields: Requests to this API places.googleapis.com method google.maps.places.v1.Places.GetPlace are blocked.
    at _.us (js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1375:304)
    at mra (js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:215:350)
(anonymous) @ SimpleMap.tsx:106
Promise.catch
(anonymous) @ SimpleMap.tsx:105
_.Kn @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1251
EXa @ onion.js:41
(anonymous) @ onion.js:39
(anonymous) @ onion.js:43
c @ VM362 common.js:107
(anonymous) @ ApplicationService.GetEntityDetails?pb=!1m2!1m1!4s18029711228931295926!2m2!1szh-TW!2sUS!6e1&callback=_xdc_._u1cr0x&key=AIza****cj1Y&token=39001:1Understand this error
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:566 As of March 1st, 2025, google.maps.places.PlacesService is not available to new customers. Please use google.maps.places.Place instead. At this time, google.maps.places.PlacesService is not scheduled to be discontinued, but google.maps.places.Place is recommended over google.maps.places.PlacesService. While google.maps.places.PlacesService will continue to receive bug fixes for any major regressions, existing bugs in google.maps.places.PlacesService will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/legacy for additional details and https://developers.google.com/maps/documentation/javascript/places-migration-overview for the migration guide.
WE @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:566
(anonymous) @ SimpleMap.tsx:108
Promise.catch
(anonymous) @ SimpleMap.tsx:105
_.Kn @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1251
EXa @ onion.js:41
(anonymous) @ onion.js:39
(anonymous) @ onion.js:43
c @ VM362 common.js:107
(anonymous) @ ApplicationService.GetEntityDetails?pb=!1m2!1m1!4s18029711228931295926!2m2!1szh-TW!2sUS!6e1&callback=_xdc_._u1cr0x&key=AIza****cj1Y&token=39001:1Understand this warning
SimpleMap.tsx:113 Place details result (fallback): {place: {…}, status: 'OK'}
SimpleMap.tsx:128 POI clicked (fallback): {id: 'ChIJLeslLNhx5kcRtkpSU9ZmNvo', name: 'Les Deux Magots', address: '6 Pl. Saint-Germain des Prés, 75006 Paris, 法國', coordinates: {…}, type: 'attraction', …}
Explore.tsx:134 Location clicked: {id: 'ChIJLeslLNhx5kcRtkpSU9ZmNvo', name: 'Les Deux Magots', address: '6 Pl. Saint-Germain des Prés, 75006 Paris, 法國', coordinates: {…}, type: 'attraction', …}
Explore.tsx:135 Setting selectedLocation and showLocationPopup
Explore.tsx:138 LocationPopup should now be visible
Explore.tsx:157 All locations: [{…}]
Explore.tsx:157 All locations: [{…}]
LocationPopup.tsx:24 LocationPopup render: {location: {…}, isOpen: true}
LocationPopup.tsx:78 LocationPopup rendering with: {location: 'Les Deux Magots', isOpen: true, screenPosition: {…}, map: true}
LocationPopup.tsx:24 LocationPopup render: {location: {…}, isOpen: true}
LocationPopup.tsx:78 LocationPopup rendering with: {location: 'Les Deux Magots', isOpen: true, screenPosition: {…}, map: true}
LocationPopup.tsx:29 Calculating screen position for: Les Deux Magots
LocationPopup.tsx:30 Map instance: _.Br {gm_bindings_: {…}, EN: _.Br, __gm: Ica, gm_accessors_: {…}, mapCapabilities: {…}, …}
LocationPopup.tsx:31 Map zoom: 14

---

**User**

Map clicked: GXa {latLng: _.dn, domEvent: MouseEvent, pixel: undefined, xi: undefined, placeId: 'ChIJD3uTd9hx5kcR1IQvGfr8dbk'}
SimpleMap.tsx:60 POI clicked, placeId: ChIJD3uTd9hx5kcR1IQvGfr8dbk
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1398  POST https://places.googleapis.com/$rpc/google.maps.places.v1.Places/GetPlace 403 (Forbidden)
_.z.send @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1398
eba @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1223
(anonymous) @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1421
(anonymous) @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1421
intercept @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1666
await in intercept
(anonymous) @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1222
Fg @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1422
Cg @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1422
google.maps.__gjsload__.$9.getPlace @ places_impl.js:60
Rvb @ places_impl.js:37
mra @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:215
await in mra
fetchFields @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:872
(anonymous) @ SimpleMap.tsx:82
_.Kn @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1251
EXa @ onion.js:41
(anonymous) @ onion.js:39
(anonymous) @ onion.js:43
c @ VM433 common.js:107
(anonymous) @ ApplicationService.GetEntityDetails?pb=!1m2!1m1!4s13363865620386383060!2m2!1szh-TW!2sUS!6e1&callback=_xdc_._w1inyc&key=AIza****cj1Y&token=6328:1Understand this error
SimpleMap.tsx:106 Error fetching place details: MapsRequestError: PLACES_GET_PLACE: PERMISSION_DENIED: Error fetching fields: Requests to this API places.googleapis.com method google.maps.places.v1.Places.GetPlace are blocked.
    at _.us (js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1375:304)
    at mra (js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:215:350)
(anonymous) @ SimpleMap.tsx:106
Promise.catch
(anonymous) @ SimpleMap.tsx:105
_.Kn @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1251
EXa @ onion.js:41
(anonymous) @ onion.js:39
(anonymous) @ onion.js:43
c @ VM433 common.js:107
(anonymous) @ ApplicationService.GetEntityDetails?pb=!1m2!1m1!4s13363865620386383060!2m2!1szh-TW!2sUS!6e1&callback=_xdc_._w1inyc&key=AIza****cj1Y&token=6328:1Understand this error
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:566 As of March 1st, 2025, google.maps.places.PlacesService is not available to new customers. Please use google.maps.places.Place instead. At this time, google.maps.places.PlacesService is not scheduled to be discontinued, but google.maps.places.Place is recommended over google.maps.places.PlacesService. While google.maps.places.PlacesService will continue to receive bug fixes for any major regressions, existing bugs in google.maps.places.PlacesService will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/legacy for additional details and https://developers.google.com/maps/documentation/javascript/places-migration-overview for the migration guide.
WE @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:566
(anonymous) @ SimpleMap.tsx:108
Promise.catch
(anonymous) @ SimpleMap.tsx:105
_.Kn @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1251
EXa @ onion.js:41
(anonymous) @ onion.js:39
(anonymous) @ onion.js:43
c @ VM433 common.js:107
(anonymous) @ ApplicationService.GetEntityDetails?pb=!1m2!1m1!4s13363865620386383060!2m2!1szh-TW!2sUS!6e1&callback=_xdc_._w1inyc&key=AIza****cj1Y&token=6328:1Understand this warning
SimpleMap.tsx:113 Place details result (fallback): {place: {…}, status: 'OK'}
SimpleMap.tsx:128 POI clicked (fallback): {id: 'ChIJD3uTd9hx5kcR1IQvGfr8dbk', name: '羅浮宮', address: '75001法國巴黎', coordinates: {…}, type: 'attraction', …}
Explore.tsx:134 Location clicked: {id: 'ChIJD3uTd9hx5kcR1IQvGfr8dbk', name: '羅浮宮', address: '75001法國巴黎', coordinates: {…}, type: 'attraction', …}
Explore.tsx:135 Setting selectedLocation and showLocationPopup
Explore.tsx:138 LocationPopup should now be visible
Explore.tsx:157 All locations: [{…}]
Explore.tsx:157 All locations: [{…}]
LocationPopup.tsx:24 LocationPopup render: {location: {…}, isOpen: true}
LocationPopup.tsx:79 LocationPopup rendering with: {location: '羅浮宮', isOpen: true, screenPosition: {…}, map: true}
LocationPopup.tsx:24 LocationPopup render: {location: {…}, isOpen: true}
LocationPopup.tsx:79 LocationPopup rendering with: {location: '羅浮宮', isOpen: true, screenPosition: {…}, map: true}

---

**User**

google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead？

有看到useEffect triggered with: {location: true, map: true, isOpen: true, locationName: '藝術橋'}
isOpen
: 
true
location
: 
true
locationName
: 
"藝術橋"
map
: 
true
[[Prototype]]
: 
Object

但是 “藝術橋” 三個字是紅色的

---

**User**

現在按到有儲存的東西會有資料了，但如果是沒有儲存的地點就沒有動靜

---

**User**

現在看起來可以點按了，但名字還是一樣都是顯示紅色的？
然後有看到這個問題VM812 js:1368 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'DJ')
最大的問題是資訊框框會一直停留在x,  y = 539, 229，沒有隨著地標移動

---

**User**

現在變成沒有辦法顯示任何地點資訊了

---

**User**

VM812 js:1368 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'DJ')

還有我每次測試都會看到要用 google.maps.places.Place，可以幫五我檢查並改成建議的這個版本api嗎

---

**User**

現在還是沒有辦法顯示任何資訊
POI clicked (fallback): {id: 'ChIJAYa7ntNx5kcRcmJxXPZ7m9k', name: '樂蓬馬歇百貨公司', address: '24 Rue de Sèvres, 75007 Paris, 法國', coordinates: {…}, type: 'attraction', …}
SimpleMap.tsx:134 Calling onLocationClick for POI (fallback)
Explore.tsx:134 Explore: Location clicked: {id: 'ChIJAYa7ntNx5kcRcmJxXPZ7m9k', name: '樂蓬馬歇百貨公司', address: '24 Rue de Sèvres, 75007 Paris, 法國', coordinates: {…}, type: 'attraction', …}
Explore.tsx:135 Explore: Setting selectedLocation and showLocationPopup
Explore.tsx:138 Explore: LocationPopup should now be visible
Explore.tsx:157 All locations: [{…}]
Explore.tsx:157 All locations: [{…}]
LocationPopup.tsx:116 LocationPopup: Rendering with {location: '樂蓬馬歇百貨公司', isOpen: true, screenPosition: {…}, map: true}
LocationPopup.tsx:116 LocationPopup: Rendering with {location: '樂蓬馬歇百貨公司', isOpen: true, screenPosition: {…}, map: true}
LocationPopup.tsx:28 LocationPopup: Calculating position for 樂蓬馬歇百貨公司
LocationPopup.tsx:50 LocationPopup: Calculated position {x: 2124234.2131484444, y: 1443055.2538193944}
LocationPopup.tsx:116 LocationPopup: Rendering with {location: '樂蓬馬歇百貨公司', isOpen: true, screenPosition: {…}, map: true}
LocationPopup.tsx:116 LocationPopup: Rendering with {location: '樂蓬馬歇百貨公司', isOpen: true, screenPosition: {…}, map: true}

---

**User**

現在有出現了，但是窗的位置會鎖定在一個位置，如果我今天地圖拉到很遠的地方並點地標，他也會出現在同樣的固定位置並且強制啦回去那個儲存的點

---

**User**

現在又變成沒有任何資訊ＱＱ

---

**User**

可以了，不過現在加進去收藏的地點，好像沒有被儲存嗎？我點進去add location之後，現在會是整個空白的，沒有地點可以點選

---

**User**

現在變成空白的了Ｑ

---

**User**

現在有幾個問題：
每個行程計劃的收藏地點應該要是獨立的儲存，像是我今天在巴黎的行程裡面儲存地點，他因該就要是在巴黎行程按下+add 的時候才會出現在可以選的範圍。
此外，現在查看儲存地點的方式和我預期的不太一樣，我想要按下加的時可以有一個一個的地點方塊在下方（不會和原本的行程視窗重疊），然後再可以左右滑動查看（像是圖片這樣）
地圖中間上方的搜尋框框不見了
左側視窗上下距離邊界的距離我覺得可以再少一點，一半就好

---

**User**

搜尋藍沒有搜尋功能
儲存之後好像沒有加進去collection成功

---

**User**

現在還是沒有辦法搜尋ㄟ？還是api做不到這個功能嗎

---

**User**

誒但是我現在搜尋到的都會是台北的景點是對的嗎？是的話也沒關係
但是我今天搜尋到位於台灣的景點後，按下去，只有出現地標資訊的卡在中間，但是沒有把地圖拉到該地點

---

**User**

誒好，現在的問題是我沒有辦法把已經排進去的行程移除？我看到上面會有叉叉圖示，但按了沒有反應（對了不管有沒有排進都會繼續存在收藏！）
然後我有測試把一些行程從收藏夾加入，但是有一些問題。舉例來說，今天是有兩天的一個行程，但是兩天顯示在地圖上的數字行程順序會合併再一起顯示。像是第一天有三個行程、第二天的第一個行程，反而會顯示4
我覺得在沒有點進去單一天的行程的時候，應該不用有數字。但是點進去每一天的時候，就會有“該天”行程順序的數字顯示在地標icon

---

**User**

誒不是我沒有要排進行程的話，他還是會在我的收藏夾。如果要從收藏夾移除是分開的！
然後現在顯示收藏夾的圖卡我覺得很不錯，但是他會是和螢幕一樣寬的位於下方，會和左側的行程視窗重疊。應該是不用有底色，可以直接有圖卡疊在地圖上（像是我之前給你的範例設計圖）然後這個容器應該也是要從左側行程視窗的在右邊一點點開始，才不會重疊

---

**User**

now the explor page is blank and I also observed a lot of error messages in the console
googleMaps.ts:46 ✅ Google Maps API loaded successfully via script tag
2Explore.tsx:205 No current trip
2LocationPopup.tsx:148 LocationPopup: Not rendering - isOpen: false location: false
TripSidebar.tsx:102 TripSidebar: Loaded saved locations for trip trip-2 : Array(4)
SavedLocationsHorizontalPanel.tsx:27 Loaded saved locations for trip trip-2 : Array(4)
TripSidebar.tsx:102 TripSidebar: Loaded saved locations for trip trip-2 : Array(4)
SavedLocationsHorizontalPanel.tsx:27 Loaded saved locations for trip trip-2 : Array(4)
2Explore.tsx:205 No current trip
2LocationPopup.tsx:148 LocationPopup: Not rendering - isOpen: false location: false
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-google-attribution" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-loading-text" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-request-error-text" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-back-button" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-dialog" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-basic-disclosure" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-basic-disclosure-section" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-attribution" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-element-support-verification" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1374 You have included the Google Maps JavaScript API multiple times on this page. This may cause unexpected errors.
Sda @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1374Understand this error
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1366 Google Maps JavaScript API has been loaded directly without loading=async. This can result in suboptimal performance. For best-practice loading patterns please see https://goo.gle/js-api-loading
$da @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1366Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-rating" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-link-button" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-menu" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-place-opening-hours" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-place-review" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-tabbed-layout" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-lightbox" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-collage" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-place-rating-summary" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-place-basic-info" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-status-text" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-circular-loader" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-use-place-details-compact" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-content-config" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-media" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-address" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-rating" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-type" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-price" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-accessible-entrance-icon" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-open-now-status" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-attribution" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-website" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-phone-number" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-opening-hours" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-summary" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-type-specific-highlights" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-reviews" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-plus-code" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-feature-list" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-details-place-request" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-place-carousel" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-internal-place-search-list-item" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-map" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-autocomplete" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-basic-place-autocomplete" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-search" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-text-search-request" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-nearby-search-request" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-details" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-details-compact" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-details-location-request" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-standard-content" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268 Element with name "gmp-place-all-content" already defined.
_.mp @ js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1268Understand this warning
googleMaps.ts:46 ✅ Google Maps API loaded successfully via script tag
Explore.tsx:209 All locations: Array(2)
Explore.tsx:209 All locations: Array(2)
2LocationPopup.tsx:148 LocationPopup: Not rendering - isOpen: false location: false
js?key=AIza****cj1Y&libraries=places,geometry&callback=initGoogleMaps:1238 InvalidValueError: setMap: not an instance of Map; and not an instance of StreetViewPanorama

---

**User**

有顯示了！現在收藏清單的效果也是我想要的，感覺應該可以先把訊息刪掉維持效能
對了現在地圖放著，儲存地標的icon會一直閃爍？

---

**User**

現在還是沒有辦法按這個行程的叉叉～按下去他應該就不會顯示在行程的頁面（但他還是會維持在有收藏的行程！）

---

**User**

現在還是會閃爍，然後console一直顯示LocationPopup: Not rendering - isOpen: false location: false
現在在行程overview還沒有點進去的時候，地圖上會完全沒有顯示行程中的地標。但是在這個頁面應該是要有的（不過不用顯示數字！重點是要標示出那些安排在整個行程的地點分佈，只要有圖示就好）

---

**User**

現在還是會一直閃爍

---

**User**

還是會誒？不知道是不是因為前面有說要寫不同頁面的顯示地標邏輯，其中有些錯誤嗎

---

**User**

還是會閃爍...
js?key=AIza****REDACTED…initGoogleMaps:1366 Google Maps JavaScript API has been loaded directly without loading=async. This can result in suboptimal performance. For best-practice loading patterns please see https://goo.gle/js-api-loading
$da	@	js?key=AIza****REDACTED…initGoogleMaps:1366

googleMaps.ts:64 ✅ Google Maps API loaded successfully via script tag
googleMaps.ts:45 ✅ Google Maps API loaded from existing script
js?key=AIza****REDACTED…initGoogleMaps:1465 As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed

---

**User**

頁面仔入失敗了是空白的SimpleMap.tsx:184 Uncaught TypeError: Cannot read properties of undefined (reading 'AdvancedMarkerElement')
    at SimpleMap.tsx:184:45
    at Array.forEach (<anonymous>)
    at SimpleMap.tsx:163:15
    at Object.react_stack_bottom_frame (react-dom_client.js?v=5678b62c:18567:20)
    at runWithFiberInDEV (react-dom_client.js?v=5678b62c:997:72)
    at commitHookEffectListMount (react-dom_client.js?v=5678b62c:9411:163)
    at commitHookPassiveMountEffects (react-dom_client.js?v=5678b62c:9465:60)
    at commitPassiveMountOnFiber (react-dom_client.js?v=5678b62c:11040:29)
    at recursivelyTraversePassiveMountEffects (react-dom_client.js?v=5678b62c:11010:13)
    at commitPassiveMountOnFiber (react-dom_client.js?v=5678b62c:11201:13)
(anonymous) @ SimpleMap.tsx:184
(anonymous) @ SimpleMap.tsx:163
react_stack_bottom_frame @ react-dom_client.js?v=5678b62c:18567
runWithFiberInDEV @ react-dom_client.js?v=5678b62c:997
commitHookEffectListMount @ react-dom_client.js?v=5678b62c:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=5678b62c:9465
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11040
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5678b62c:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=5678b62c:11066
flushPassiveEffects @ react-dom_client.js?v=5678b62c:13150
(anonymous) @ react-dom_client.js?v=5678b62c:12776
performWorkUntilDeadline @ react-dom_client.js?v=5678b62c:36
<SimpleMap>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=5678b62c:247
Explore @ Explore.tsx:363
react_stack_bottom_frame @ react-dom_client.js?v=5678b62c:18509
renderWithHooksAgain @ react-dom_client.js?v=5678b62c:5729
renderWithHooks @ react-dom_client.js?v=5678b62c:5665
updateFunctionComponent @ react-dom_client.js?v=5678b62c:7475
beginWork @ react-dom_client.js?v=5678b62c:8525
runWithFiberInDEV @ react-dom_client.js?v=5678b62c:997
performUnitOfWork @ react-dom_client.js?v=5678b62c:12561
workLoopSync @ react-dom_client.js?v=5678b62c:12424
renderRootSync @ react-dom_client.js?v=5678b62c:12408
performWorkOnRoot @ react-dom_client.js?v=5678b62c:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5678b62c:13505
performWorkUntilDeadline @ react-dom_client.js?v=5678b62c:36
<Explore>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=5678b62c:247
App @ App.tsx:17
react_stack_bottom_frame @ react-dom_client.js?v=5678b62c:18509
renderWithHooksAgain @ react-dom_client.js?v=5678b62c:5729
renderWithHooks @ react-dom_client.js?v=5678b62c:5665
updateFunctionComponent @ react-dom_client.js?v=5678b62c:7475
beginWork @ react-dom_client.js?v=5678b62c:8525
runWithFiberInDEV @ react-dom_client.js?v=5678b62c:997
performUnitOfWork @ react-dom_client.js?v=5678b62c:12561
workLoopSync @ react-dom_client.js?v=5678b62c:12424
renderRootSync @ react-dom_client.js?v=5678b62c:12408
performWorkOnRoot @ react-dom_client.js?v=5678b62c:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5678b62c:13505
performWorkUntilDeadline @ react-dom_client.js?v=5678b62c:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=5678b62c:247
(anonymous) @ main.tsx:8Understand this error
Explore.tsx:363 An error occurred in the <SimpleMap> component.

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about er

---

**User**

現在儲存地點在地圖上的標示還是會閃爍
此外，點選任一地方會出現這個錯誤訊息
POI clicked, placeId: ChIJGbRBHW7cQUcR3db-N5BF4a0
js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:2109  POST https://places.googleapis.com/$rpc/google.maps.places.v1.Places/GetPlace 403 (Forbidden)
(anonymous) @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:2109
eba @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:1934
(anonymous) @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:2132
(anonymous) @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:2132
intercept @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:2377
await in intercept
(anonymous) @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:1933
Fg @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:2133
Cg @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:2133
$9.getPlace @ places_impl.js:60
Rvb @ places_impl.js:37
mra @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:231
await in mra
fetchFields @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:888
(anonymous) @ SimpleMap.tsx:84
(anonymous) @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:1962
EXa @ onion.js:41
(anonymous) @ onion.js:39
(anonymous) @ onion.js:43
c @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:1295
(anonymous) @ ApplicationService.GetEntityDetails?pb=!1m2!1m1!4s12529372124038485725!2m2!1szh-TW!2sUS!6e1&callback=_xdc_._8cut1f&key=AIza****cj1Y&token=91698:1Understand this error
SimpleMap.tsx:111 Error fetching place details with new API: MapsRequestError: PLACES_GET_PLACE: PERMISSION_DENIED: Error fetching fields: Requests to this API places.googleapis.com method google.maps.places.v1.Places.GetPlace are blocked.
    at _.us (js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:2086:304)
    at mra (js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:231:350)
(anonymous) @ SimpleMap.tsx:111
Promise.catch
(anonymous) @ SimpleMap.tsx:110
(anonymous) @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:1962
EXa @ onion.js:41
(anonymous) @ onion.js:39
(anonymous) @ onion.js:43
c @ js?key=AIza****cj1Y&libraries=places,geometry,marker&callback=initGoogleMaps:1295
(anonymous) @ ApplicationService.GetEntityDetails?pb=!1m2!1m1!4s12529372124038485725!2m2!1szh-TW!2sUS!6e1&callback=_xdc_._8cut1f&key=AIza****cj1Y&token=91698:1Understand this error
SimpleMap.tsx:112 Falling back to old PlacesService API...

---

**User**

現在沒有錯誤訊息了，但還是會閃爍，上面也沒有數字顯示
然後我是想要一點進來這個行程的時候會聚焦在安排的點得部分沒錯，但是現在會沒有辦法拖移到其他地方，會被強製拉回來

這個會有影響嗎？
js?key=AIza****REDACTED…=initGoogleMaps:582 As of March 1st, 2025, google.maps.places.PlacesService is not available to new customers. Please use google.maps.places.Place instead. At this time, google.maps.places.PlacesService is not scheduled to be discontinued, but google.maps.places.Place is recommended over google.maps.places.PlacesService. While google.maps.places.PlacesService will continue to receive bug fixes for any major regressions, existing bugs in google.maps.places.PlacesService will not be addressed.

---

**User**

現在有數字了但還是會不斷閃爍
此外左邊的行程，當安排比較多個點的時候像現在這樣超出頁面，沒有辦法下滑