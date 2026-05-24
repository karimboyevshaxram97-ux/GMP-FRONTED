print("===== Iterable objects & RANGE =====")  # Konsolga sarlavha chiqaradi

# Iterable objects > string dict tuple list range map filter
# Izoh: Python'da ko‘p turdagi iterable obyektlar mavjud (string, dict, tuple, list, range, map, filter)

# 0 dan 2 gacha bo‘lgan range obyektini yaratadi
range_obj = range(3)
# range obyektining o‘zini chiqaradi (range(0, 3))
print("range_obj:", range_obj)

for letter in "MIT":                                  # "MIT" stringidagi har bir harfni aylantirib chiqadi
    # Har bir harfni konsolga chiqaradi
    print(f"the letter: {letter}")

# range(0,3) ichidagi elementlarni aylantirib chiqadi
for ele in range_obj:
    # Har bir elementni konsolga chiqaradi
    print(f"the element: {ele}")

# Dictionary bo‘limi sarlavhasini chiqaradi
print("===== DICTIONARY =====")

# Dictionary is JSON object!
# Lug‘at (dict) yaratish: kalit-qiymat juftliklari
person = {"name": "Justin", "age": 25, "single": True}
# dict() funksiyasi orqali lug‘at yaratish
person_obj = dict(name="Justin", age=25, single=True)
# person lug‘atini konsolga chiqaradi
print(f"the person: {person}")
# person_obj lug‘atini konsolga chiqaradi
print(f"the person_obj: {person_obj}")

# method: get()
# name = person_obj["name"]                                         # Kalit orqali qiymat olish (agar mavjud bo‘lmasa xato beradi)
# get() metodi orqali "name" qiymatini oladi
name = person_obj.get("name")
# "hobby" kaliti mavjud emas, None qaytaradi
hobby = person_obj.get("hobby")
# "balance" kaliti yo‘q, default qiymat sifatida 0 qaytaradi
balance = person_obj.get("balance", 0)
# Olingan qiymatlarni chiqaradi
print(f"the name: {name}, hobby: {hobby} and balance: {balance}")

# "single" kalitini lug‘atdan o‘chiradi
del person_obj["single"]
# person_obj ichidagi barcha kalitlarni aylantirib chiqadi
for key in person_obj:
    # Har bir kalit va uning qiymatini chiqaradi
    print(f"the key: {key} > value {person_obj.get(key)}")
