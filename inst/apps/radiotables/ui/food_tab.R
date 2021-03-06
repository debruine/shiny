### food_tab ----

# set up tab in sheet if not there
if (USING_GS4 &&
    !"food" %in% gs4_get(SHEET_ID)$sheets$name) {
  sheet_add(SHEET_ID, "food")
} else if (!file.exists("data/food.csv")) {
  write_csv(data.frame(), "data/food.csv")
}

# radio_table setup
food_q <- c(
  apple = "Apples 🍎",
  banana = "Bananas 🍌",
  carrot = "Carrots 🥕",
  donut = "Donuts 🍩",
  eggplant = "Eggplants 🍆"
)

food_opts <- c(
  "Hate it",
  "Dislike it", 
  "Meh",
  "Like it",
  "Love it"
)

food_tab <- tabItem(
  tabName = "food_tab",
  box(id = "food_box", 
      width = 12, 
      collapsible = TRUE,
      collapsed = FALSE,
      solidHeader = TRUE,
      title = "Food Questionnaire",
      p("How much do you like each food?"),
      radioTableInput("food_table", food_q, food_opts, random = FALSE),
      actionButton("food_submit", "Submit")
  ),
  tabsetPanel(id = "food_plots",
              tabPanel("Individual Data", plotOutput("food_plot")),
              tabPanel("Summary Data", plotOutput("food_summary"))
  )
)