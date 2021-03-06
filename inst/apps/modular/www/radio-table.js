$(function() {
  // radio-table functions //
  
  // set default view based on screen width
  $('.radio-table').toggleClass("select-view", window.innerWidth < 600);
  
  // triger an input change each time a table value changes
  // allows observeEvent(input$table_id_changed, {}) in app.R
  $('.radio-table select').on("change", function() {
    table_id = $(this).closest("table.radio-table").get(0).id;
    // console.debug(table_id + ' : ' + this.id);
    Shiny.setInputValue(table_id + "_changed", null);
    Shiny.setInputValue(table_id + "_changed", true);
  });

  // update selectize on radio button change
  $('body').on('click', '.radio-table input',  function(e) {
    e.stopPropagation(); // don't trigger td click
    $(this).parents('tr').find('td').removeClass('checked');
    $(this).parents('td').addClass('checked');
    $('#' + this.name).selectize()[0].selectize.setValue(this.value, false);
  });
  
  // extend clickable region to full cell
  $('body').on('click', '.radio-table td.radio-button', function(e) {
    var ipt = $(this).find("input");
    ipt.click();
  });
  
  // update radio buttons on selectize change
  $('.radio-table select').selectize({
    onChange: function(value) {
      var id = this.$control_input[0].id.replace('-selectized', '');
      $('input[type=radio][name="'+id+'"]').prop('checked', false);
      $('input[type=radio][name="'+id+'"][value="'+value+'"]').prop('checked', true);
    }
  });

  // toggle table vs select view
  $('body').on('click', '.radio-toggle', function(e) {
    $(this).next('table.radio-table').toggleClass("select-view");
  });

});
