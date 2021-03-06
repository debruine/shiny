# Reading and saving data {#data}

## Local Data

You can read and write data from a Shiny app the same way you do from any R script. We will focus on reading data, since writing data locally can cause problems and is better done with [Google Sheets](#google_sheets).

The base directory for a Shiny app is the directory that app.R is in. I recommend keeping your data in a directory called "data" to keep things tidy.


```r
# read local data
my_data <- readxl::read_xls("data/my_data.xls")

# read data on the web
countries <- readr::read_csv("https://datahub.io/core/country-list/r/data.csv")
languages <- jsonlite::read_json("https://datahub.io/core/language-codes/r/language-codes.json")
```


## Google Sheets {#google_sheets}

One of the best ways to start collecting data with a Shiny app is with Google Sheets. This allows you to collect data to the same place from multiple servers, which might happen if you're running the app locally on more than one computer or through a service like [shinyapps.io](https://shinyapps.io){target="_blank"}. The R package `googlesheets4` makes it easy to work with Google Sheets from R.




If you just want to read data from a public Google Sheet, you don't need any authorisation. Just start your code with `gs4_deauth()` after you load the `googlesheets4` library (otherwise you'll be prompted to log in). Then you can read data like this:


```r
library(googlesheets4)
gs4_deauth()
sheet_id <- "https://docs.google.com/spreadsheets/d/1tQCYQrI4xITlPyxb9dQ-JpMDYeADovIeiZZRNHkctGA/"
read_sheet(sheet_id)
```

<div class="kable-table">

| number|letter |
|------:|:------|
|      1|A      |
|      2|B      |
|      3|C      |

</div>

However, even if a Google Sheet is publicly editable, you can't add data to it without authorising your account.


```r
data <- data.frame(number = 4, letter = "D")
sheet_append(sheet_id, data)
```

```
## Error: Client error: (401) UNAUTHENTICATED
## * Request not authenticated due to missing, invalid, or expired OAuth token.
## * Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project.
```

You can authorise interactively using the following code (and your own email), which will prompt you to authorise "Tidyverse API Packages" the first time you do this.


```r
gs4_auth(email = "debruine@gmail.com")
```

However, this won't work if you want your Shiny apps to be able to access your Google Sheets.

### Authorisation for Apps

First, you need to get a token and store it in a cache folder in your app directory. We're going to call that directory ".secrets". Run the following code in your console (NOT in an Rmd file). This will open up a web browser window and prompt you to choose your Google account and authorise "Tidyverse API Packages".


```r
setwd(app_directory)
gs4_auth(email = "debruine@gmail.com", cache = ".secrets")

# optionally, authorise google drive to search your drive
# googledrive::drive_auth(email = "debruine@gmail.com", cache = ".secrets")
```

<div class="figure" style="text-align: center">
<img src="images/gs4_choose_account.png" alt="Prompts to choose an account, grant permissions, and confirm." width="30%" /><img src="images/gs4_auth.png" alt="Prompts to choose an account, grant permissions, and confirm." width="30%" /><img src="images/gs4_confirm_auth.png" alt="Prompts to choose an account, grant permissions, and confirm." width="30%" />
<p class="caption">(\#fig:gs4-auth)Prompts to choose an account, grant permissions, and confirm.</p>
</div>

When you have finished, you will see a page that says something like, "Authentication complete. Please close this page and return to R." In the file pane in RStudio, you should now see a directory. called ".secrets" in the app directory.

If you are using GitHub, you don't want to save your secret info to a public repository, so run the following code to ignore any directories called ".secrets" (so they will only exist on your computer and not on GitHub).


```r
usethis::use_git_ignore(".secrets")
usethis::use_git_ignore("*/.secrets")
```

Now, you can include the following code at the top of your app.R script to authorise the app to read from and write to your files.


```r
gs4_auth(cache = ".secrets", email = "debruine@gmail.com")
```

### Accessing an existing sheet

If you have an existing [Google Sheet](https://docs.google.com/spreadsheets/u/0/){target="_blank"}, you can access it by URL.


```r
sheet_id <- "https://docs.google.com/spreadsheets/d/1tQCYQrI4xITlPyxb9dQ-JpMDYeADovIeiZZRNHkctGA/"
data <- data.frame(number = 4, letter = "D")
sheet_append(sheet_id, data)
read_sheet(sheet_id)
```

<div class="kable-table">

| number|letter |
|------:|:------|
|      1|A      |
|      2|B      |
|      3|C      |
|      4|D      |

</div>

### Make a new sheet

You can set up a new Google Sheet with code. You only need to do this once for a sheet that you will use with a Shiny app, and you will need to save the sheet ID. If you don't specify the tab name(s), the sheet will be created with one tab called "Sheet1". I recommend making only one sheet per app and saving each table in a separate tab.



```r
id <- gs4_create("demo2", sheets = c("demographics", "questionnaire"))
id
```

```
## Spreadsheet name: demo2
##               ID: 1E54Z6heGXSUxg0CHM9U9bZ1dDc7nV3U_tHwVR813qJU
##           Locale: en_US
##        Time zone: Europe/London
##      # of sheets: 2
## 
##  (Sheet name): (Nominal extent in rows x columns)
##  demographics: 1000 x 26
## questionnaire: 1000 x 26
```




Include the ID at the top of your app like this:

<pre><code>SHEET_ID <- "1E54Z6heGXSUxg0CHM9U9bZ1dDc7nV3U_tHwVR813qJU"</code></pre>

### Add data

You can add an empty data structure to your sheet by specifying the data types of each column like this:


```r
data <- data.frame(
  name = character(0),
  birthyear = integer(0),
  parent = logical(0),
  score = double(0)
)

write_sheet(data, SHEET_ID, "demographics")
read_sheet(SHEET_ID, "demographics") %>% names()
```

```
## [1] "name"      "birthyear" "parent"    "score"
```
Or you can populate the table with starting data.


```r
data <- data.frame(
  name = "Lisa",
  birthyear = 1976L,
  R_user = TRUE,
  score = 10.2
)

write_sheet(data, SHEET_ID, "demographics")
read_sheet(SHEET_ID, "demographics")
```

<div class="kable-table">

|name | birthyear|R_user | score|
|:----|---------:|:------|-----:|
|Lisa |      1976|TRUE   |  10.2|

</div>

<div class="info">
<p>Notice that <code>birthyear</code> is a double, not an integer. Google Sheets only have one numeric type, so both doubles and integers are coerced to doubles.</p>
</div>

### Appending data

Then you can append new rows of data to the sheet.


```r
data <- data.frame(
  name = "Robbie",
  birthyear = 2007,
  R_user = FALSE,
  score = 12.1
)

sheet_append(SHEET_ID, data, "demographics")
read_sheet(SHEET_ID, "demographics")
```

<div class="kable-table">

|name   | birthyear|R_user | score|
|:------|---------:|:------|-----:|
|Lisa   |      1976|TRUE   |  10.2|
|Robbie |      2007|FALSE  |  12.1|

</div>

If you try to append data of a different type, some weird things can happen. Logical values added to a numeric column are cast as 0 (FALSE) and 1 (TRUE), while numeric values added to a logical column change the column to numeric. If you mix character and numeric values in a column, the resulting column is a column of one-item lists so that each list can have the appropriate data type. (Data frames in R cannot mix data types in the same column.)


```r
data <- data.frame(
  name = 1,
  birthyear = FALSE,
  R_user = 0,
  score = "No"
)

sheet_append(SHEET_ID, data, "demographics")
read_sheet(SHEET_ID, "demographics")
```

<div class="kable-table">

|name   | birthyear| R_user|score |
|:------|---------:|------:|:-----|
|Lisa   |      1976|      1|10.2  |
|Robbie |      2007|      0|12.1  |
|1      |         0|      0|No    |

</div>
<div class="danger">
<p>You must append data that has the same number and order of columns as the Google Sheet. If you send columns out of order, they will be recorded in the order you sent them, not in the order of the column names. If you send extra columns, the append will fail.</p>
</div>


The Shiny template we're working with has a safer version of `sheet_append()` that you can access by uncommenting the line:

`# source("R/sheet_append.R")`

This version gracefully handles data with new columns, missing columns, columns in a different order, and columns with a different data type. However, it reads the whole data sheet before deciding whether to append or overwrite the data, which can slow down your app, so is best used only during development when you're changing things a lot. Once you have the final structure of your data, it's better to use the original `googlesheets4::sheet_append()` function.

## Glossary {#glossary-data}



