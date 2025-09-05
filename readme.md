# potential updates?
* change structure of ratings section of JSON to be just a list of all ratings, and calculate total/min/max/avg in the charts instead? Or maybe just add an item {all ratings:[rating, rating, rating,...]}



{
    program_name: ,
    month: ,
    ratings: {
        Total Responses: ,
        Minimum Rating: ,
        Maximum Rating: ,
        Average Rating: 
    }
    responses: [
        {
            question: ,
            counts:
            {
                response_name: count,
            }
        }
        {
            question: ,
            counts:
            {
                response_name: count,
            }
        }
        {
            question: ,
            counts:
            {
                response_name: count,
            }
        }
    ]
}

First prompt with new data: Using the file at this url https://github.com/soudersmax/plotly_dashboard/blob/master/charts.js as a guide, create a bar chart for each question across all programs.