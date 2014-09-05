
define(["d3"], function(d3) {
	"use strict";

	return {

		/*
		 * This will store the values as 
		 * filterValues[columnName] => {type: <sometype>, ...}
		 *
		 * For category it will look like:
		 * {type: "category-single", any: true/false, value: "value1"}
		 *
		 * For category with multiselect it will look like:
		 * {type: "category-multi", any: true/false, valueList: ["value1", "value2"]}
		 * The any is the top choice.
		 *
		 * For year
		 * {type: "year", minValue: 2003, maxValue: 2008}
		 *
		 * For other numeric ranges
		 * {type: "numeric", minValue: 4, maxValue: 20}
		 */
		filterValues: {},

		anyString: "--------",

		/*
		 * should be set by external program
		 */
		formChangedCallback: function(columnName) {
		},

		getFilterNamesForType: function(filters, filterType) {
			var result = [];

			for (var key in filters) {
				if (filters.hasOwnProperty(key)) {
					if (filters[key].type === filterType) {
						result.push(key);
					}
				}
			}

			return result;
		},

		columnNameToClassName: function(columnName) {
			return columnName.replace(/\W+/, "-").toLowerCase();
		},

		addLocationFieldset: function(formElement) {
			var fieldset = formElement.append("fieldset")
				.attr("class", "filters-group group-location");
			fieldset.append("legend")
				.attr("class", "filter-group-title group-location")
				.text("Key Countries");

			return fieldset;
		},

		addLocationField: function(fieldset, filters, columnName) {
			var cName = this.columnNameToClassName(columnName);
			var values = filters[columnName].values;

			var locationP = fieldset.append("p")
				.attr("class", "form-item location-" + cName);
			locationP.append("label")
				.attr("for", cName + "-location-select")
				.text(columnName);
			var locationSelect = locationP.append("select")
				.attr("id", cName + "-location-select")
				.attr("class", "multiselect");

			if (values.length > 1) {
				locationSelect.append("option")
					.attr("value", this.anyString)
					.text("Any " + columnName);
			}
			for (var i = 0; i < values.length; i++) {
				var textValue = values[i] ? values[i] : "<Blank " + columnName + ">";
				locationSelect.append("option")
					.attr("value", values[i])
					.text(textValue);
			}

			var moduleThis = this;
			locationSelect.on("change", function() {
				// the data/index arguments d3 gives us are useless, so gather
				// the info we need in this closure
				// `this` currently refers to the select element
				if (this.value === moduleThis.anyString) {
					moduleThis.filterValues[columnName].any = true;
					moduleThis.filterValues[columnName].valueList = [];
				} else {
					moduleThis.filterValues[columnName].any = false;
					moduleThis.filterValues[columnName].valueList = [this.value];
				}
				moduleThis.formChangedCallback(columnName);
			});

			this.filterValues[columnName] = {
				type: "category-multi",
				any: true,
				valueList: []
			};
		},

		addYearFieldset: function(formElement, filters, columnName) {
			var yearFieldset, yearP, yearSelect, year, yearOption,
				moduleThis = this,
				yearInfo = filters[columnName];

			yearFieldset = formElement.append("fieldset")
				.attr("class", "filters-group group-year");
			yearFieldset.append("legend")
				.attr("class", "filter-group-title year")
				.text("Year range");

			yearP = yearFieldset.append("p")
				.attr("class", "form-item year-from");
			yearP.append("label")
				.attr("for", "year-select-from")
				.text("From");
			yearSelect = yearP.append("select")
				.attr("id", "year-select-from");
			for (year = yearInfo.min; year <= yearInfo.max; year++) {
				yearOption = yearSelect.append("option")
					.attr("value", year.toString())
					.text(year.toString());
				if (year === yearInfo.min) {
					yearOption.attr("selected", "selected");
				}
			}
			yearSelect.on("change", function() {
				// `this` currently refers to the select element
				moduleThis.filterValues[columnName].minValue = this.value;
				moduleThis.formChangedCallback(columnName);
			});

			yearP = yearFieldset.append("p")
				.attr("class", "form-item year-to");
			yearP.append("label")
				.attr("for", "year-select-to")
				.text("To");
			yearSelect = yearP.append("select")
				.attr("id", "year-select-to");
			for (year = yearInfo.min; year <= yearInfo.max; year++) {
				yearOption = yearSelect.append("option")
					.attr("value", year.toString())
					.text(year.toString());
				if (year === yearInfo.max) {
					yearOption.attr("selected", "selected");
				}
			}
			yearSelect.on("change", function() {
				// `this` currently refers to the select element
				moduleThis.filterValues[columnName].maxValue = this.value;
				moduleThis.formChangedCallback(columnName);
			});

			this.filterValues[columnName] = {
				type: "year",
				minValue: yearInfo.min,
				maxValue: yearInfo.max
			};
		},

		addCategoryField: function(fieldset, filters, columnName) {
			var cName = this.columnNameToClassName(columnName);
			var values = filters[columnName].values;
			var multiselect = filters[columnName].multiselect;

			var categoryP = fieldset.append("p")
				.attr("class", "form-item category-" + cName);
			categoryP.append("label")
				.attr("for", cName + "-select")
				.text(columnName);
			var categorySelect = categoryP.append("select")
				.attr("id", cName + "-select");
			if (multiselect) {
				categorySelect.attr("class", "multiselect");
			}

			if (values.length > 1) {
				categorySelect.append("option")
					.attr("value", this.anyString)
					.text("Any " + columnName);
			}
			for (var i = 0; i < values.length; i++) {
				var textValue = values[i] ? values[i] : "<Blank " + columnName + ">";
				categorySelect.append("option")
					.attr("value", values[i])
					.text(textValue);
			}

			var moduleThis = this;
			categorySelect.on("change", function() {
				// the data/index arguments d3 gives us are useless, so gather
				// the info we need in this closure
				// `this` currently refers to the select element
				if (this.value === moduleThis.anyString) {
					moduleThis.filterValues[columnName].any = true;
					if (multiselect) {
						moduleThis.filterValues[columnName].valueList = [];
					} else {
						moduleThis.filterValues[columnName].value = null;
					}
				} else {
					moduleThis.filterValues[columnName].any = false;
					if (multiselect) {
						moduleThis.filterValues[columnName].valueList = [this.value];
					} else {
						moduleThis.filterValues[columnName].value = this.value;
					}
				}
				moduleThis.formChangedCallback(columnName);
			});

			if (multiselect) {
				this.filterValues[columnName] = {
					type: "category-multi",
					any: true,
					valueList: []
				};
			} else {
				this.filterValues[columnName] = {
					type: "category-single",
					any: true,
					value: null
				};
			}
		},

		addQuantityColumnChooser: function(formElement, filters) {
			var quantityFieldset,
				//quantityColumns = this.getFilterNamesForType(filters, "quantity");
				quantityColumns = filters.Quantity.values;

			quantityFieldset = formElement.append("fieldset")
				.attr("class", "filters-group group-units");
			quantityFieldset.append("legend")
				.attr("class", "filter-group-title units")
				.text("Column to use for quantity");

			var quantityP = quantityFieldset.append("p")
				.attr("class", "form-item category-quantity");
			quantityP.append("label")
				.attr("for", "quantity-select")
				.text("Quantity");
			var quantitySelect = quantityP.append("select")
				.attr("id", "quantity-select");

			for (var i = 0; i < quantityColumns.length; i++) {
				quantitySelect.append("option")
					.attr("value", quantityColumns[i])
					.text(quantityColumns[i]);
			}

			var moduleThis = this;
			quantitySelect.on("change", function() {
				// the data/index arguments d3 gives us are useless, so gather
				// the info we need in this closure
				// `this` currently refers to the select element
				moduleThis.filterValues.quantityColumn.any = false;
				moduleThis.filterValues.quantityColumn.value = this.value;
				moduleThis.formChangedCallback("quantityColumn");
			});

			this.filterValues.quantityColumn = {
				type: "category-single",
				any: false,
				value: quantityColumns[0]
			};
		},

		createFormFromFilters: function(formElement, filters) {
			var i, locationFilters, locationFieldset, yearFilters,
				categoryFilters, categoryFieldset;

			// TODO: recreate country filter stuff
			locationFieldset = this.addLocationFieldset(formElement);
			locationFilters = this.getFilterNamesForType(filters, "location");
			for (i = 0; i < locationFilters.length; i++) {
				this.addLocationField(locationFieldset, filters, locationFilters[i]);
			}

			yearFilters = this.getFilterNamesForType(filters, "year");
			if (yearFilters.length === 1) {
				this.addYearFieldset(formElement, filters, yearFilters[0]);
			} else if (yearFilters.length > 1) {
				console.log('More than one column with type "year" !!!');
			}

			this.addQuantityColumnChooser(formElement, filters);

			categoryFilters = this.getFilterNamesForType(filters, "text");
			if (categoryFilters.length > 0) {
				categoryFieldset = formElement.append("fieldset")
					.attr("class", "filters-group group-category");
				categoryFieldset.append("legend")
					.attr("class", "filter-group-title category")
					.text("Categories");
			}
			for (i = 0; i < categoryFilters.length; i++) {
				this.addCategoryField(categoryFieldset, filters, categoryFilters[i]);
			}

			/* TODO: numeric filter - how does it mesh with quantity column?
			var numericFieldset = formElement.append("fieldset")
				.attr("class", "filters-group group-numeric");
			*/
		}
	};
});
