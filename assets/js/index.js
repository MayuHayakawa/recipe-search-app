getRandomMeal();
fetchFavMeals();

// get the random meal's data
async function getRandomMeal() {
    let response = await $.ajax({
        url: 'https://www.themealdb.com/api/json/v1/1/random.php',
        dataType: 'json'
    });
    let randomMeal = response.meals[0]; // get only 1 object
    // console.log(randomMeal);
    
    showMeal(randomMeal, true);
}


// search the meal's data by keyword
$(".serach-btn").on("click", async function(event) {
    event.preventDefault();
    $(".meals-container").html("");
    
    let query = $("#search-meals").val();
    let meals = await getMealsBySearch(query);
    
    if(meals) {
        meals.forEach((meal) => {
            showMeal(meal);
        });
    };
});
//get meals object much with keyword
async function getMealsBySearch(keyword) {
    let response = await $.ajax({
        url: 'https://www.themealdb.com/api/json/v1/1/search.php?s=' + keyword,
        dataType: 'json'
    });
    let meals = response.meals; // get all object that much with keyword
    return meals;
}


// show the meals datas & pictures
function showMeal(mealData, random = false) {
    let card = $(document.createElement('div'));
    card.addClass('col-md-4 col-sm-6 col-xs-12 position-relative');

    card.html(`
        <div class="card m-1">
            <div class="card-header p-0">
                ${random ? `<span class="random">Random Recipe</span>` : ``}
                <img src="${mealData.strMealThumb}" class="card-img-top" alt="${mealData.strMeal}">
            </div>
            <div class="card-body d-flex">
                <h6 class="card-title px-1 w-100">${mealData.strMeal}</h6>
                <button class="fav-btn flex-shrink-1 ${mealData.idMeal}" id="fav-btn">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    `);
    
    // !create eventhandler for the card element because fav-btn selector doesn't exist when this method is executed
    // add or remove recipe from local strage
    $(card).on("click", ".fav-btn", function() {
        // console.log($(this));
        if($(this).hasClass("active")) {
            removeMealFromLocalStorage(mealData.idMeal);
            $(this).removeClass("active");
        } else {
            addMealToLocalStorage(mealData.idMeal);
            $(this).addClass("active");
        };
        fetchFavMeals();
    });
    //show recipe's detail
    $(card).on("click", function(event) {
        if(!$(event.target).closest(".fav-btn").length) {
            // console.log($(this));
            showMealDetail(mealData);
        }
    });

    $(".meals-container").append(card);

    checkFavBtn(mealData.idMeal);  

};
// check if favorite meal or not
function checkFavBtn(mealId) {
    let favMealList = [];
    let mealIds = getMealLocalStorage();
    if($.inArray(mealId, mealIds) !== -1) {
        let id = mealId;
        console.log(id);
        console.log($("." + id));
        $("." + id).addClass("active");
    };
};


// show the meals information
function showMealDetail(mealData) {
    $(".meal-info").html("");
    
    let mealDetail = $(document.createElement('div'));
    mealDetail.addClass('');

    let ingredients = [];
    for(let i = 1; i <= 20; i++) {
        if(mealData['strIngredient'+i]) {
            ingredients.push(`${mealData['strIngredient'+i]} - ${mealData['strMeasure'+i]}`);
        } else {
            break;
        };
    };
    // <img src="${mealData.strMealThumb}" class="card-img-top" alt="${mealData.strMeal}">
    // <div class="card-body">

    mealDetail.html(`
        <h1 class="text-center">${mealData.strMeal}</h1>
        <div class="row m-1 d-flex justify-content-center">
            <div class="col-sm-6 col-xs-12 position-relative">
                <img src="${mealData.strMealThumb}" alt="${mealData.strMeal} object-fit-none">
            </div>
            <div class="col-sm-6 col-xs-12 position-relative">
                <h3 class="text-center">Ingredients</h3>
                <ul>${ingredients.map((data) => `<li>${data}</li>`).join("")}</ul>
            </div>
        </div>
        <hr>
        <p>${mealData.strInstructions}</p>
    `);

    $(".meal-info").append(mealDetail);
    $(".popup-container").removeClass("hidden");
};
// popup close
$(".close-popup").on("click", function() {
    $(".popup-container").addClass("hidden");
});


// create favorite meals array
function fetchFavMeals() {
    $(".fav-meals").html("");
    let favMealList = [];
    let mealIds = getMealLocalStorage();

    if(mealIds.length === 0) {
        $(".header-container").addClass("hidden");
    } else {
        $(".header-container").removeClass("hidden");
        mealIds.forEach(async function(mealId) {
            let favMeal = await getMealById(mealId);
            showFavMeal(favMeal);
        });
    };

}
// catch fav meal data from local storage
function getMealLocalStorage() {
    let mealIds = JSON.parse(localStorage.getItem("mealIds"));
    return mealIds === null ? [] : mealIds;
}
// get the favorite meal's data by id
async function getMealById(id) {
    let response = await $.ajax({
        url: 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id,
        dataType: 'json'
    });
    let favMeal = response.meals[0];
    return favMeal;
}
// show the favorite meals names & pictures
function showFavMeal(mealData) {
    let favMeals = $(document.createElement("li"));
    favMeals.addClass('fav-meals-item mx-3');

    favMeals.html(`
        <div class="fav-meals-item-img-container">
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" class="object-fit-cover rounded-5"/>
        </div>
        <span>${mealData.strMeal}</span>
        <button class="delete-btn"><i class="fas fa-window-close"></i></button>
    `);

    $(favMeals).on("click", ".delete-btn", function() {
        removeMealFromLocalStorage(mealData.idMeal);
        fetchFavMeals();
    });

    favMeals.on("click", ".fav-meals-item-img-container", function() {
        showMealDetail(mealData);
    });

    $(".fav-meals").append(favMeals);
}


// remove meal from local storage
function removeMealFromLocalStorage(mealId) {
    let mealIds = getMealLocalStorage();
    localStorage.setItem("mealIds", JSON.stringify(mealIds.filter((id) => id !== mealId)));
}


// add meal to local storage
function addMealToLocalStorage(mealId) {
    let mealIds = getMealLocalStorage();
    // check if there is same item in local strage using id
    if($.inArray(mealId, mealIds) === -1) {
        localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]))
    }
};



