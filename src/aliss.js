const $ = require('jquery');

const ALISSRequest = function() {
  var context = this;

  this.lastResponse = {};

  this.parametersObject = {
    "postcode": null,
    "q": null,
    "category": null,
    "location_type": null,
    "radius": 5000,
    "page_size": 10,
    "page": 1
  };

  // Function to convert the stores parameters to a no null object
  ALISSRequest.prototype.prepareParams = function() {
    var currentQuery = context.parametersObject;
    var queryParameters = {};
    for (var prop in currentQuery){
      if (currentQuery[prop] !== null) {
        queryParameters[prop]= currentQuery[prop];
      }
    };
    return queryParameters;
  }

  //  Class method to set the page size parameter of the global request object
  ALISSRequest.prototype.pageSize = function (pageSize) {
    context.parametersObject.page_size = pageSize;
  };

  ALISSRequest.prototype.category = function (category) {
    context.parametersObject.category = category;
  }

  ALISSRequest.prototype.keyword = function (keyword) {
    context.parametersObject.q = keyword;
  }
}


const ALISSConfig = function () {
  var context = this;
  context.config = null;

  context.displayOptions = {
    "show_category_select": true,
    "show_keyword_search": true
  };

  ALISSConfig.prototype.hideCategories = function () {
    context.displayOptions.show_category_select = false;
  }

  ALISSConfig.prototype.hideKeyword = function () {
    context.displayOptions.show_keyword_search = false;
  }

  ALISSConfig.prototype.setOptions = function(config){
    context.config = config;
  }

  ALISSConfig.prototype.processOptions = function(request){
    if (context.config != null){
      for (var option in context.config) {
        if (option.includes("show")){
          context.displayOptions[option] = context.config[option];
        } else {
          request.parametersObject[option] = context.config[option];
        }
      }
    } else {
      request = new ALISSRequest();
      return
    }
  }
}


const ALISS = function(target, config) {
  this.aliss = null;
  this.config = null;
  this.request = null;
  var context = this;

  ALISS.prototype.init = function(target, config) {
    context.request = new ALISSRequest();
    context.config = new ALISSConfig();
    if (config){ context.config.setOptions(config);  }
    context.generateForm(target);
  }

  ALISS.prototype.generateForm = (target) => {
    $(target).empty();
    $(target).append("<div id=aliss-target-div></div>")
    context.renderForm();
  }

  ALISS.prototype.regenerateForm = () => {
    context.request = new ALISSRequest();
    context.renderForm();
  }

  ALISS.prototype.renderForm = () => {
    context.config.processOptions(context.request);
    var inputForm = document.createElement('form');
    inputForm.id = "aliss-input-form"
    $(inputForm).append("<input type=text id=aliss-postcode-field></input>");
    $(inputForm).append("<input type=submit id=aliss-submit></input>");
    $('#aliss-target-div').empty();
    $('#aliss-target-div').append(inputForm);
    $('#aliss-target-div').append("<div id=aliss-search-header-div><div>")
    $('#aliss-search-header-div').hide();
    $('#aliss-target-div').append("<div id=aliss-category-selector-div><div>")
    $('#aliss-category-selector-div').hide();
    $('#aliss-target-div').append("<div id=aliss-load-animation class=spinner></div>")
    $('#aliss-load-animation').hide();
    $('#aliss-input-form').append("<div id=aliss-invalid-message>Please Enter Valid Postcode</div>");
    $('#aliss-invalid-message').hide();
    context.renderCategoryDropdown()
    $('#aliss-submit').click(this.handlePostCodeSubmit);
  }

  // On click of form submit button take user input and call the API
  ALISS.prototype.handlePostCodeSubmit = function(event) {
    event.preventDefault()
    var formattedPostcode = context.processPostcode( $('#aliss-postcode-field')[0].value);
    context.request.parametersObject["postcode"] = formattedPostcode;
    context.apiRequest(context.renderResults);
  }

  ALISS.prototype.processPostcode = function (submitted) {
    var trimmedString = submitted.trim();
    var noSpace = trimmedString.replace(/\s/g, '');
    var upCase = noSpace.toUpperCase();
    var postcodeLength = upCase.length;
    var first = upCase.slice(0, (postcodeLength - 3));
    var second = upCase.slice((postcodeLength - 3), postcodeLength);
    var formattedPostcode = first + " " + second;
    return formattedPostcode;
  }

  // Call the API with the User Data and call the RenderList method function with response
  ALISS.prototype.apiRequest = (renderFunction) => {
    $('#aliss-load-animation').show();
    setTimeout(function(){$('#aliss-invalid-message').show()}, 1000);
    $.ajax({
      url: "https://www.aliss.org/api/v4/services/",
      data: context.request.prepareParams(),
      success: function(response){ 
        renderFunction(response); 
        context.lastResponse = response;
      }
      // error: renderPostcodeError
    });
    $('#aliss-load-animation').hide();
    $('#aliss-invalid-message').hide();
  }

  //Render the results div
  ALISS.prototype.renderResults = (response) => {
    var query = $('#aliss-postcode-field').val();
    $('#aliss-input-form').hide();
    $('#aliss-invalid-message').hide();
    $('#aliss-search-header-div').append("<h2 class=aliss-results-heading>Help & support in "+ context.processPostcode(query) +"</h2>");
    $('#aliss-search-header-div').append("<button id=aliss-search-again-header class=aliss-search-again-header>Search Again</button>");
    $('#aliss-search-again-header').click(context.regenerateForm)
    $('#aliss-search-header-div').show();
    $('#aliss-target-div').append("<div id=aliss-results-div class=aliss-results-div><div>")
    $('#aliss-results-div').empty();
    $('#aliss-results-div').append("<div id=aliss-filter-field-div class=aliss-filter-field-div></div>")
    $('#aliss-results-div').append("<div id=aliss-listings-div class=listings-div></div>")
    $('#aliss-results-div').append("<div id=aliss-category-selector-div class=aliss-category-selector-div><d/iv>")
    if (context.config.displayOptions.show_category_select) {
      $('#aliss-category-selector-div').show();
    }
    $('#aliss-results-div').append("<div id=aliss-pagination-div></div>");
    context.renderFilterFields(response);
    context.renderServiceList(response);
  };

  ALISS.prototype.renderPagination = function () {
    $('#aliss-pagination-div').empty();

    if (context.request.parametersObject["page"] > 1){
      $('#aliss-pagination-div').append("<button id=aliss-previous-page>Previous Page</button>");
      $('#aliss-previous-page').val("previous");
    }

    $('#aliss-pagination-div').append("<p id=aliss-current-page></p>");
    var p = (context.request.parametersObject["page"]) ? context.request.parametersObject["page"] : "1";
    $('#aliss-current-page').text("Page: " + p);

    if ($('#aliss-next-page-link').val() != "") {
      $('#aliss-pagination-div').append('<button id="aliss-next-page">Next Page</button>');
      $('#aliss-next-page').val("next");
    }

    $('#aliss-pagination-div button').click(context.handlePageChange);
    $('#aliss-pagination-div').append("<h4 id=aliss-no-previous-message>Start of Pages Please Select Next</h4>");
    $('#aliss-no-previous-message').hide();
    $('#aliss-pagination-div').append("<h4 id=aliss-no-next-message>End of Results Please Go Back</h4>");
    $('#aliss-no-next-message').hide();
  }

  ALISS.prototype.handlePageChange = function (event) {
    if (event.target.value === "next"){
      context.request.parametersObject["page"] += 1;
    } else if (event.target.value === "previous") {
      context.request.parametersObject["page"] -= 1;
    }

    context.apiRequest(context.renderServiceList);  
  }

  ALISS.prototype.renderCategoryDropdown = function () {
    $.ajax({
      url: "https://www.aliss.org/api/v4/categories/",
      data: {},
      success: function(response){
        $('#aliss-category-selector-div').empty();
        context.renderCategoryOptions(response);
      }
    })
  }

  //Render the top level categories and filter the results based on their selection.
  ALISS.prototype.renderCategoryOptions = function (response) {
    var dropdownDiv = document.createElement('div')
    dropdownDiv.id = "aliss-dropdown-div";
    dropdownDiv.className = "aliss-category-dropdown-div";
    $('#aliss-category-selector-div').append(dropdownDiv);
    var dropdownSelect = document.createElement('select');
    dropdownSelect.id = "aliss-dropdown";
    dropdownSelect.className = "aliss-dropdown";
    $('#aliss-dropdown-div').append(dropdownSelect);
    $('#aliss-dropdown').append("<option value=categories>Categories</option>");
    $.each(response.data, function(index, category){
      var option = document.createElement("option");
      option.textContent = category.name;
      option.id = category.slug;
      option.className = "aliss-category-option";
      option.value = category.slug;
      $('#aliss-dropdown').append(option);
      $('#' + option.id).data(category);
    });

    if (this.request.parametersObject["category"] != null){
      var predefinedCategory =  this.request.parametersObject["category"];

      if ($('#aliss-dropdown:contains(' + predefinedCategory + ')')) {
        $('#' + predefinedCategory).attr("selected", true);
        var categoryObject = $('#' + predefinedCategory).data();
        var target = $('#' + predefinedCategory).parent().parent();
        this.renderSubCategoryDropdown(categoryObject, target);
      }
    }

    $('#aliss-dropdown').change(context.handleFilterByCategory);
  }

  // When user selects dropdown option re call API and render the filtered service list
  ALISS.prototype.handleFilterByCategory = () => {
    $(this).siblings().remove();

    //   If the "blank" category option is selected remove category filter and render the list of services
    if (event.target.value == "categories"){
      context.request.parametersObject["category"] = null;
      context.request.parametersObject["page"] = null;
      context.apiRequest(context.renderServiceList)
      context.renderCategoryDropdown();
      return;
    }
    //   If the "blank" sub-category option is selected remove sub-category filter and render the list of services
    if (event.target.value == "sub-categories"){
      var parentID = $(this).parent()[0].id;
      console.log("parent id?", parentID)
      var sortedID = parentID.replace('-select', "")
      var categoryObject = $('#' + sortedID).data();
      var target = $(this).parent();
      target.children().remove();
      context.renderSubCategoryDropdown(categoryObject, target);
      context.request.parametersObject["category"] = sortedID;
      context.request.parametersObject["page"] = null;
      context.apiRequest(context.renderServiceList);
      return;
    }

    var categoryObject = $('#' + event.target.value).data();
    var target = $(this).parent();
    context.renderSubCategoryDropdown(categoryObject, target);
    context.request.parametersObject["category"] = event.target.value;
    context.request.parametersObject["page"] = null;
    context.apiRequest(context.renderServiceList);
  }

  ALISS.prototype.renderSubCategoryDropdown = function (categoryObject, target) { //RORY: We need to handle what happens when a user selects a sub-category then wants to clear the sub-category
    if (categoryObject.sub_categories.length === 0){
      return;
    }
    var subDiv = document.createElement('div');
    subDiv.id = categoryObject.slug + '-select';

    var subCategoryDropDown = document.createElement('select');
    subCategoryDropDown.className = "aliss-sub-category-dropdown";

    var blankOption = document.createElement('option');
    blankOption.textContent = "Sub-Category";
    blankOption.value = "sub-categories";
    subCategoryDropDown.appendChild(blankOption);

    $(target).append(subDiv);
    $(subDiv).append(subCategoryDropDown);

    $.each(categoryObject.sub_categories, function(index, item){
      var subCategoryOption = document.createElement('option');
      subCategoryOption.textContent = item.name;
      subCategoryOption.id = item.slug;
      subCategoryOption.className = "aliss-sub-category-option";
      subCategoryOption.value = item.slug;
      subCategoryDropDown.appendChild(subCategoryOption);
      $('#' + subCategoryOption.id).data(item);
    });

    $(subCategoryDropDown).change(context.handleFilterByCategory);
  }

  ALISS.prototype.renderFilterFields = function(response) {
    $('#aliss-filter-field-div').append("<h3 class=aliss-filter-field-header>Filter results</h3>")
    context.renderKeywordSearch()
    context.renderLocationTypeRadio()
  };

  ALISS.prototype.renderLocationTypeRadio = function () {
    $('#aliss-filter-field-div').append("<div id=location-type-div class=location-type-div></div>");
    $('#location-type-div').append("<form id=aliss-form-locality></form>")
    // $('#aliss-form-locality').append("<fieldset id=aliss-fieldset></fieldset>")
    $('#aliss-form-locality').append("<legend>Filter by local or national: </legend>");
    $('#aliss-form-locality').append("<input id=default type=radio checked name=locality value= ></input>")
    $('#aliss-form-locality').append("<label for=default type=radio checked name=locality value= >Show me all services, local and national</label>")
    $('#aliss-form-locality').append("<br>")
    $('#aliss-form-locality').append("<input id=local type=radio name=locality value=local></input>")
    $('#aliss-form-locality').append("<label for=local>Only show the services that operate locally</input>")
    $('#aliss-form-locality').append("<br>")
    $('#aliss-form-locality').append("<input id=national type=radio name=locality value=national></input>")
    $('#aliss-form-locality').append("<label for=national>Only show services that operate nationally</input>")
    $('#aliss-form-locality').append("<br>")
    $('input[type=radio][name=locality]').change(context.handleFilterByLocality);
  }

  //Render the keyword search text input
  ALISS.prototype.renderKeywordSearch = () => {
    $('#aliss-filter-field-div').append("<div id=aliss-keyword-search-div></div>");
    $('#aliss-keyword-search-div').empty();

    var form = $("<form></form>");
    form.append("<label>Filter by keyword:</label>")
    var formInput = $("<input type=text id=aliss-keyword-search placeholder='e.g. Diabetes'></input>");
    if (context.request.parametersObject.q !== null){
      formInput.val(context.request.parametersObject.q);
    }
    form.append(formInput);
    form.append("<input type=submit id=aliss-keyword-submit></input>");

    $('#aliss-keyword-search-div').append(form);

    form.submit(function( event ) {
      console.log("Handler for submit() called.");
      event.preventDefault();
    });

    $('#aliss-keyword-submit').click(context.handleFilterByKeyword);

    if (!context.config.displayOptions.show_keyword_search) {
      $('#aliss-keyword-search-div').hide();
    }
  }

  // Handle the change of location type radio button selection
  ALISS.prototype.handleFilterByLocality = function (evt) {
    context.request.parametersObject["page"] = null;
    context.request.parametersObject["location_type"] = evt.target.value;
    context.apiRequest(context.renderServiceList)
  }

  // Handle the user searching by keyword API call.
  // Currently not changing results due to potential server side bug
  ALISS.prototype.handleFilterByKeyword = function(event) {
    event.preventDefault();
    context.request.parametersObject["page"] = null;
    context.request.parametersObject["q"] = $('#aliss-keyword-search')[0].value
    context.apiRequest(context.renderServiceList)
  };

  //Render lists from API response
  ALISS.prototype.renderServiceList = function(response) {
    var servicesArray = response.data;
    if (servicesArray.length < 1){
      context.renderSearchAgainButton()
      $('#aliss-pagination-div').hide()
      return;
    }
    var list = document.createElement('div');
    $.each(servicesArray, function(index, item){
      context.renderListItem(list, item);
    });
    $('#aliss-listings-div').empty();
    $('#aliss-listings-div').append("<p id=aliss-next-page-link display=hidden></p>")
    $('#aliss-next-page-link').val(response.next);
    $('#aliss-listings-div').append(list);
    $('#aliss-invalid-message').hide();
    $('#aliss-pagination-div').show();

    context.renderPagination();
  };

  //Render the service list items
  ALISS.prototype.renderListItem = function(list, service){
    var serviceCardDiv = document.createElement('div')
    serviceCardDiv.className = "aliss-service-card-div"

    var serviceHeader = document.createElement('div')
    var serviceName = document.createElement('a')
    serviceName.textContent = service.name;
    serviceName.setAttribute('href', service.aliss_url)
    serviceName.className = "aliss-service-title";
    serviceHeader.appendChild(serviceName);
    serviceCardDiv.appendChild(serviceHeader);

    var serviceProvider = document.createElement('div')
    var serviceProviderName = document.createElement('a');
    serviceProviderName.textContent = "by " + service.organisation.name;
    serviceProviderName.setAttribute('href', service.organisation.aliss_url)
    serviceProvider.appendChild(serviceProviderName)
    if (service.organisation.is_claimed === true){
      var serviceProviderClaimed = document.createElement('p')
      serviceProviderClaimed.className = "aliss-claimed";
      serviceProviderClaimed.textContent = "✔"
      serviceProvider.appendChild(serviceProviderClaimed);
    }
    serviceCardDiv.appendChild(serviceProvider);

    var serviceDescriptionDiv = document.createElement('div')
    var serviceDescription = document.createElement('p')
    serviceDescription.textContent = service.description;
    serviceDescriptionDiv.appendChild(serviceDescription)
    serviceCardDiv.appendChild(serviceDescriptionDiv)

    if (service.locations.length > 0) {
      var serviceLocationDiv = document.createElement('div')
      var serviceLocation = document.createElement('a');
      serviceLocation.textContent = service.locations[0].formatted_address
      var locationParameter = service.locations[0].formatted_address.replace(/\ /g, "+").replace(/\,/, "%2C")
      serviceLocation.setAttribute('href', "https://www.google.com/maps/search/?api=1&query=" + locationParameter)
      serviceLocationDiv.appendChild(serviceLocation)
      serviceCardDiv.appendChild(serviceLocationDiv)
    }

    var serviceDetailsDiv = document.createElement('div');
    var serviceDetails = document.createElement('ul');

    if (service.phone) {
      var serviceTelephone = document.createElement('li');
      serviceTelephone.textContent = service.phone;
      serviceDetails.appendChild(serviceTelephone);
    }

    if (service.url != "") {
      var serviceWebsiteLi = document.createElement('li')
      var serviceWebsiteLink = document.createElement('a')
      serviceWebsiteLink.textContent = "Website"
      serviceWebsiteLink.setAttribute('href', service.url)
      serviceWebsiteLi.appendChild(serviceWebsiteLink)
      serviceDetails.appendChild(serviceWebsiteLi)
    }

    if (service.service_areas.length > 0) {
      var serviceAreasLi = document.createElement('li')
      var serviceAreasLink = document.createElement('a')
      serviceAreasLink.textContent = "Service Areas:"
      serviceAreasLi.appendChild(serviceAreasLink)
      serviceDetails.appendChild(serviceAreasLi)
      context.handleRenderServiceAreaList(service, serviceDetails)
    }

    serviceDetailsDiv.appendChild(serviceDetails);
    serviceCardDiv.appendChild(serviceDetailsDiv);

    var separationLine = document.createElement('hr')
    serviceCardDiv.appendChild(separationLine);

    $(list).append(serviceCardDiv);
  };

  ALISS.prototype.handleRenderServiceAreaList = function (service, serviceDetails) {
    var serviceAreaListDiv = document.createElement('div')
    var serviceAreaList = document.createElement('ul')
    $.each(service.service_areas , function(index, item){
      var listItem = document.createElement('li')
      listItem.textContent = item.name
      serviceAreaList.appendChild(listItem)
    })
    serviceAreaListDiv.appendChild(serviceAreaList)
    serviceDetails.appendChild(serviceAreaListDiv)
  }

  //Render a search again button which increases radius of search
  ALISS.prototype.renderSearchAgainButton = function () {
    $('#aliss-listings-div').empty()
    $('#aliss-listings-div').append("<h3>Sorry, we couldn't find anything using those terms near EH21 6UW.</h3>")
    $('#aliss-listings-div').append("<p>You can try searching again over a wider area:</p>")
    $('#aliss-listings-div').append("<button id=aliss-search-again-radius>Search Again</button>")
    $('#aliss-invalid-message').hide();
    $('#aliss-search-again-radius').click(context.handleSearchAgainRadius);
  }

  // When the user selects search again when presented with no results the API is called with the radius doubled
  ALISS.prototype.handleSearchAgainRadius = function () {
    context.request.parametersObject["radius"] = (context.request.parametersObject["radius"] * 2)
    context.apiRequest(context.renderServiceList);
  }

  context.init(target, config);
};

module.exports = ALISS;