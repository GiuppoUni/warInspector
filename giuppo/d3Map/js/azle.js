
create_azle(function() {
	az.load_font('Bahianita')
	az.style_body({
		"background": "rgb(51, 47, 47)",
		"min-width": "1300px"
	})
	az.add_sections({
		"this_class": "my_sections",
		"sections": 1
	})
	az.style_sections('my_sections', 1, {
        "background": "rgb(51, 47, 47)",
        "height": "auto"
	})
	az.add_image('my_sections', 1, {
		"this_class": "app_logo",
		"image_path": "https://www.thehagueinstituteforglobaljustice.org/wp-content/uploads/2015/12/sipri-335x190.jpg"
	})
	az.style_image('app_logo', 1, {
		"align": "center",
		"width": "100px"
	})
	az.add_text('my_sections', 1, {
		"this_class": "app_title",
		"text": "WarMonopoly",
	})
	az.style_text('app_title', 1, {
		"color": "white",
		"align": "center",
        "font-size": "50px",
		"font-family": "Bahianita"
	})
	az.add_layout('my_sections', 1, {
		"this_class": "top_banner_layout",
		"row_class": "top_banner_layout_rows",
		"cell_class": "top_banner_layout_cells",
		"number_of_rows": 1,
		"number_of_columns": 2
	})
	az.style_layout('top_banner_layout', 1, {
		"align": "center",
		"height": "80px",
		"column_widths": ['65%', '35%'],
		"border": 3
	})
	az.add_layout('top_banner_layout_cells', 1, {
		"this_class": "hold_dropdowns_layout",
		"row_class": "hold_dropdowns_layout_rows",
		"cell_class": "hold_dropdowns_layout_cells",
		"number_of_rows": 1,
		"number_of_columns": 3
	})
	az.style_layout('hold_dropdowns_layout', 1, {
		"width": "100%",
		"height": "100%",
		"border": 3
	})
	az.add_layout('my_sections', 1, {
		"this_id":"map",
        "this_class": "visual_layout",
		"row_class": "visual_layout_rows",
		"cell_class": "visual_layout_cells",
		"number_of_rows": 1,
		"number_of_columns": 2
	})
	az.style_layout('visual_layout', 1, {
        "align": "center",
        "background": "rgb(39, 36, 36)",
		"border-radius": "4px",
		"height": "460px",
		"margin-top": "10px",
		"column_widths": ['65%', '35%'],
		"border": 3
	})


	// az.style_layout("visual_layout_cells",1, {
	// 	"this_id":"map"
	// })

	//For a new section
	// az.add_sections({
	// 	"this_class": "my_sections",
	// 	"sections": 1
	// })


	// az.add_d3_visual('visual_layout_cells', 2, {
    //     "this_class": "my_d3",
    //     "html_path": "visuals/barchart.html",
    //     "wrapper_arguments": barchart_wrapper_args,
    //     "extra_functions": barchart_extras
    // })
})