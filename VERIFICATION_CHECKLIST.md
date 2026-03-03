# ✅ Firebase Rules Setup Verification Checklist

## Rules ঠিকভাবে set হয়েছে কিনা জানতে এই checklist ফলো করুন:

### ✓ Firebase Console এ যাওয়া হয়েছে?

- [ ] https://console.firebase.google.com এ গেছি
- [ ] প্রজেক্ট "next-firebase-dummy" খুলেছি
- [ ] Firestore Database খুলেছি

### ✓ Rules Tab এ পৌঁছেছি?

- [ ] "Rules" ট্যাব ক্লিক করেছি (Data, Indexes, Rules থেকে)
- [ ] Rules editor সামনে আছে

### ✓ নতুন Rules পেস্ট করেছি?

- [ ] সব পুরাতন code delete করেছি (Ctrl+A → Delete)
- [ ] নতুন rules code paste করেছি
- [ ] কোন red error দেখা যাচ্ছে না

### ✓ Publish করেছি?

- [ ] নিচের "Publish" বাটন ক্লিক করেছি
- [ ] সবুজ checkmark ✓ দেখেছি
- [ ] "Publish succeeded" মেসেজ দেখেছি

---

## এখন অ্যাপ টেস্ট করুন:

### ✓ App এ products দেখা যাচ্ছে?

1. Browser এ যান: `http://localhost:3000`
2. F5 দিয়ে refresh করুন
3. [ ] Products দেখা যাচ্ছে (error না দেখিয়ে)

### ✓ Guest User (বিনা login) test:

1. [ ] Products দেখা যাচ্ছে ✅
2. [ ] "Login to Buy" button আছে ✅
3. [ ] "Add to cart" button নেই (লুকানো) ✓

### ✓ Logged-in User test:

1. [ ] Login করেছি (email দিয়ে)
2. [ ] Products দেখা যাচ্ছে ✅
3. [ ] "Add to cart" button আছে ✅
4. [ ] কার্টে আইটেম যোগ করতে পারছি ✅
5. [ ] Order place করতে পারছি ✅

---

## 🆘 যদি এখনও error দেখায়:

### Error: "Failed to load products"

- [ ] Rules publish succeeded কিনা দেখুন (সবুজ checkmark)
- [ ] Browser cache clear করুন (Ctrl+Shift+Delete)
- [ ] Page reload করুন (Ctrl+Shift+R)
- [ ] Browser console খুলুন (F12) - error কী দেখাচ্ছে?

### Error: "Permission denied"

- [ ] Rules সঠিকভাবে paste হয়েছে?
- [ ] কোনো typo আছে?
- [ ] Syntax error নেই (red squiggly lines)?

### Products দেখা যাচ্ছে কিন্তু Add to cart করতে পারছি না:

- [ ] Login করেছেন?
- [ ] Page refresh করুন (F5)
- [ ] Firebase auth ঠিকঠাক কিনা check করুন

---

## 📞 যদি সাহায্য দরকার:

1. Browser console খুলুন: **F12**
2. **Console** tab ক্লিক করুন
3. কী error দেখাচ্ছে তা নোট করুন
4. শেয়ার করুন

---

## ✨ সাফল্যের সাইন:

✅ Products দেখা যাচ্ছে (guest হিসেবেও)
✅ Guest users "Login to Buy" দেখছে
✅ Logged-in users "Add to cart" দেখছে
✅ কোনো Firebase error নেই

**অভিনন্দন!** Setup সফল হয়েছে! 🎉
