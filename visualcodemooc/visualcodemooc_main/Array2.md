# Array2

## More Concepts of Java Arrays

**Initialization with Values**:  
Arrays can also be initialized directly with values during declaration.
```java
int[] numbers = {10, 20, 30, 40, 50}; // creates and initializes an array
```

**Iterating Over an Array**:  
You can use loops, such as `for` or `for-each`, to iterate through each element in the array.
```java
for (int i = 0; i < numbers.length; i++) {
    System.out.println(numbers[i]); // prints each element
}

for (int number : numbers) {
    System.out.println(number); // enhanced for loop to print each element
}
```

**Passing Arrays to Methods**:  
Arrays can be passed as arguments to methods, allowing you to manipulate the array within the method.
```java
public void printArray(int[] arr) {
    for (int num : arr) {
        System.out.println(num);
    }
}
```

**Copying Arrays**:  
You can copy an array using methods like `System.arraycopy()` or using the `Arrays.copyOf()` method.
```java
int[] copiedArray = Arrays.copyOf(numbers, numbers.length); // copies the entire array
```
## Short Video Lecture
(Video here)

## VisualCodeChat Tutoring  (Exercise: Replace Number)
Interact and Learn with VisualCodeChat!

<iframe src="https://www.vizai.site/#/new-chat?mask=100009" width="1000" height="700" frameborder="0"></iframe>


## After-class Exercises
(Exercises here)