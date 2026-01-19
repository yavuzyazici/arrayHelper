# Text List to Array Converter

Easily transform your text lists into array formats compatible with JS, SQL, PHP, PERL, PYTHON (as a list), and many other languages. This tool allows for quick and seamless conversions, offering flexible customization options for handling strings and numbers in various formats.

Live demo available at: [Array Helper](https://www.arrayhelper.com)

🌍 **Languages:**  
🇹🇷 [Türkçe](README-TR.md) | 🇬🇧 English

![Og Image Preview](https://www.arrayhelper.com/images/arrayHelper-og.png)  

Preview:
![Live Preview](https://www.arrayhelper.com/images/Readme%20Image%201.jpg)  
![Live Preview](https://www.arrayhelper.com/images/Readme%20Image%202.jpg)

Lighthouse:
![Live Preview](https://www.arrayhelper.com/images/LightShot.jpg)


## Table of Contents

- [Features](#features)
- [Usage](#usage)
- [Options](#options)
- [Contributing](#contributing)

## Features

- **Instant Conversion**: Convert text lists into array formats for JavaScript, SQL, PHP, PERL, PYTHON, and more.
- **Custom Formatting**: Choose between single or double quotes for strings, and decide whether numbers should be quoted or plain.
- **Copy Outputs**: Easily copy converted outputs for Raw, JavaScript, and SQL formats.
- **User Preferences**: Save and load your preferred settings (quote style and number format) for future use.
- **Line Numbering**: Synchronize line numbering with the text input for easy tracking.

## Usage

### Input

1. Enter your text list into the editor. Each line should be a separate item.
2. Click the "Convert" button to generate formatted outputs in:
   - **Raw Output**: Comma-separated values (CSV) style.
   - **JavaScript Array**: Properly formatted JavaScript array.
   - **SQL IN Clause**: Formatted for SQL `IN()` statements.

### Example:

**Input:**  
apple  
banana  
42  
orange  

**Output:**

- **Raw Output:** `"apple", "banana", 42, "orange"`
- **JavaScript Array:** `["apple", "banana", 42, "orange"]`
- **SQL IN Clause:** `IN ("apple", "banana", 42, "orange")`

### Copy Outputs

Use the "Copy" buttons next to each format to copy the converted output to your clipboard for quick pasting into your code.

## Options

You can adjust the following settings to customize your output:

- **Quote Style**: Choose between single (`'`) or double (`"`) quotes for strings.
- **Number Format**: Choose whether numbers should be output as plain (e.g., `42`) or quoted (e.g., `"42"`).

## Contributing

Contributions are welcome! Please fork this repository and submit pull requests for any features, fixes, or improvements you would like to see.
