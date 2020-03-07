az.components = {
	"search_by_country": function search_by_country(target_class, target_instance, options) {
		az.add_layout(target_class, target_instance, {
			"this_class": "search_country_layout",
			"row_class": "search_country_layout_rows",
			"cell_class": "search_country_layout_cells",
			"number_of_rows": 1,
			"number_of_columns": 2
		})
		az.style_layout('search_country_layout', 1, {
			"width": "auto",
			"height": "auto",
			"border": 0
		})
		az.all_style_layout('search_country_layout_cells', {
			"valign": "center",
			"halign": "center"
		})
		az.add_input('search_country_layout_cells', 1, {
			"this_class": "search_bar",
			"placeholder": "search by country..."
		})
		az.style_input('search_bar', 1, {
			"outline": 0
		})
		az.add_icon('search_country_layout_cells', 2, {
			"this_class": "search_country",
			"icon_class": "fa-search"
		})
		az.style_icon('search_country', 1, {
			"color": "white",
			"font-size": "30px",
			"cursor": "pointer",
			"margin-left": "5px"
		})
		az.add_event('search_country', 1, {
			"type": "click",
			"function": function() {
				if (az.grab_value('search_bar', 1) !== '') {
					az.style_iframe('hold_table', 1, {
						"display": "block"
					})
					az.style_iframe('hold_barchart', 1, {
						"display": "none"
					})
					az.post_message_to_frame('hold_table', 1, {
						"function": function() {
							main.redefine("fakeData", parent.filter_by_country())
						}
					})
					az.all_remove_element('barchart_buttons_layout')
				} else {
					az.animate_element('search_bar', 1, {
						"type": "rubberBand"
					})
				}
			}
		})
	}
}