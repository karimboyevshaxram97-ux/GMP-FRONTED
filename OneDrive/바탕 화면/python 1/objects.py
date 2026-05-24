
'''OBJECTS 
1) WHAT IS OBJECTS
2) INTERABLE OBJECTS 
3) DICTIONARY 
4) ERROE HANDLING
'''
import array  # package/module
import math  # package
from math import ceil
print("=====What is object =====")
# an object has state and method properties.
# Everything is object in python!

print(type('Hello World!'))
print(type(100))
print(type(True))
print(type(array))
print(type(math))

# Paradigma > Functional Programming & OOP
# OOP 4 CONCEPTS > Abstraction | Encapsulation | Inheritence | Polimorphism
result1 = math.ceil(97.7)  # Call
print("result:", result1)

result2 = ceil(98.7)
print("result2:", result2)
