# Homepage

For full documentation visit [mkdocs.org](https://www.mkdocs.org).

## Code Annotation Examples

### Codeblocks

Some `code` goes here

### Plain codeblock

A plain codeblock:

```
//Some code here
def myfunction():
    //statements
```

### Code for a specific language

some code with the `py` at teh start:

``` py
import pandas as pd
def myfunction():
    statements...
```

### Code with a title

``` py title="bubble_sort.py"
def bubble_sort(arr):
    statements...
```

### Code with line numbers

``` py linenums="1"
def bubble_sort(items):
    for i in range(len(items)):
        for j in range(len(items)-1-i):
            if items[j] > items[j+1]:
                items[j], items[j+1] = items[j+1], items[j]
```


### Highlight lines

``` py hl_lines="2 3"
def bubble_sort(items):
    for i in range(len(items)):
        for j in range(len(items)-1-i):
            if items[j] > items[j+1]:
                items[j], items[j+1] = items[j+1], items[j]
```

## Icons and Emojis

:smile:

:fontawesome-regular-face-laugh-wink:

:fontawesome-brands-twitter:{ .twitter }

:octicons-heart-fill-24:{ .heart }
