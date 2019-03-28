
(function(){
	var app = angular.module('store',[ "ngRoute"]);
	app.config(function($routeProvider) {
		$routeProvider
		.when("/products", {
		    templateUrl : "products.html"
		})
		.when("/signup", {
		    templateUrl : "signup.html"
		})
		.when("/mycart", {
		    templateUrl : "mycart.html"
		})
		.when("/login", {
		    templateUrl : "login.html"
		})
		.otherwise({redirectTo:"/products"});
	});

app.run(function($rootScope) {
    $rootScope.cartProduct = [];
    $rootScope.cartCount = 0 ;
    $rootScope.payment = 0 ;
});
  app.controller('PopupController',['$scope','$rootScope',function ($scope,$rootScope) {


  }]);

app.controller('headerNavController',['$scope','$rootScope',function ($scope,$rootScope) {
	$scope.mycartCount = $rootScope.cartCount; 
	$scope.mycartClicked = function () {
		if($rootScope.cartCount === 0 ){
			alert("Cart is empty");
		}
	}
}]);

app.controller ('StoreController',['$scope','$http' ,'$rootScope','$timeout',function($scope,$http,$rootScope, $timeout){
	var thisVar = this;
	thisVar.products  = [];
	thisVar.productDetailsArray = [] ;
	thisVar.showPreview = false;
	thisVar.showAddedToCart = false;
    thisVar.alreadyAdded = false; 
	$scope.totalDisplayed = 2 ;

	$http.get("products.json").then(function(prod) {
		thisVar.products = prod.data;
	});
	$scope.selectedItemChanged = function(event){
		if($scope.category === "Smartphone"){
	 		$scope.name = ["Mi", "Apple", "Vivo"];
		}else	
		if($scope.category === "Laptop"){
			 $scope.name = ["Lenovo", "Hp", "dell"];
		}
		$scope.Brand = "";
	};

	$scope.priceFiltering = function(){
        $scope.showFilters();

        $scope.minPrice = $scope.price_slider.start[0];
	    $scope.maxPrice = $scope.price_slider.start[1];

	    $scope.pricefilter = function (product) {
        	if ((product.price <= $scope.maxPrice) && (product.price >= $scope.minPrice)){
           	 return product;
       	 }
       		$scope.form.$setPristine();
    	};
	};
	 	$scope.categories = ["Smartphone", "Laptop"];
	
	$scope.addToCart = function() {
    	var thisID = this.product.uid;
    	var isDuplicate = false;
    	
    	$rootScope.cartProduct.forEach(function (element) {
            if (element.uid == thisID) {
                isDuplicate = true ;
                thisVar.alreadyAdded = true;
	    		$timeout( function(){
		      		thisVar.alreadyAdded = false;
		        }, 1000 );
	        }
	    });
        if (!isDuplicate) {
	    	$rootScope.cartProduct.push({
	    		uid:this.product.uid, 
	    		name:this.product.name, 
	    		description:this.product.description, 
	    		image:this.product.image, 
	    		price:this.product.price
	    	});
        };
    	
    	$rootScope.cartCount =	$rootScope.cartProduct.length;
    	thisVar.showAddedToCart = true;
    	$timeout( function(){
    		$scope.closePreview();
    		thisVar.showAddedToCart = false;
       		
        }, 1000 );

	};

	$scope.productDetails = function() {
		thisVar.productDetailsArray = [] ;
    	thisVar.productDetailsArray.push({
    		uid:this.product.uid, 
    		name:this.product.name, 
    		soldOut:this.product.soldOut, 
    		canPurchase:this.product.canPurchase, 
    		description:this.product.description, 
    		image:this.product.image, 
    		price:this.product.price
    	});
       	thisVar.showPreview = true;
       	$(".product-detail-specs").niceScroll({cursorborder:"",cursorcolor:"#A9A9A9"});

       	
	};
  
    $scope.closePreview = function() {
        thisVar.showPreview = !thisVar.showPreview;
  	};
  
  	$scope.loadMore = function() {
		$scope.totalDisplayed += 2 ;
	};

	$scope.clearPrice = function () {
		$scope.form.$setPristine();
		$scope.priceFiltering();
	};
	$scope.visible = true;
	$scope.close = false;
    $scope.showFilters = function () {
		$scope.visible = !$scope.visible;
        $scope.close = 	!$scope.close ;
        // $(".filters").css("display","block");
        console.log("filters");
    };
	$(".filters").niceScroll({cursorborder:"",cursorcolor:"#A9A9A9"});
	$(".tab1").niceScroll({cursorborder:"",cursorcolor:"#A9A9A9"});
	//$(".main-content").niceScroll({cursorborder:"",cursorcolor:"#fff"});


}]);


app.controller("MycartController",["$rootScope","$scope",function($rootScope,$scope){
	var thisVar = this;
	thisVar.products = $rootScope.cartProduct ;
	thisVar.cartCount = $rootScope.cartCount;
	thisVar.totalAmount = 0;

	$scope.deleteFromCart = function (index) {
    	thisVar.products.splice(index, 1);
    	thisVar.cartCount = $rootScope.cartCount = thisVar.products.length;
		
		thisVar.totalAmount = 0;
		for (var i=0;i<this.cartCount;i++){
		thisVar.totalAmount += thisVar.products[i].price;
	}
	};

	for (var i=0;i<this.cartCount;i++){
		thisVar.totalAmount += thisVar.products[i].price;
	}

	paypal.Button.render({
        env: 'sandbox', // Optional: specify 'sandbox' environment
		//nik.autospace@gmail.com paypal account id's of shoppingcart@angular.com
        client: {
            sandbox:    'ATBa8C-xzN6X-BnrEVrDUrnClCupXmiGOgEXcYDtNHT-0oFqen45y1WYKF5JubxLnZD8Vbiz_xqtjh2S',
            production: '<insert production client id>'
        },

        payment: function() {
            var env    = this.props.env;
            var client = this.props.client;
 
            return paypal.rest.payment.create(env, client, {
                transactions: [
                    {
                        amount: { total: thisVar.totalAmount , currency: 'INR' }
                    }
                ]
            });
        },
        commit: true, // Optional: show a 'Pay Now' button in the checkout flow
        onAuthorize: function(data, actions) {
            // Optional: display a confirmation page here
            return actions.payment.execute().then(function() {
				alert("Payment Successfull");
			   // Show a success page to the buyer
            
            });
        }

    }, '#paypal-button');
	$(".added-products").niceScroll({cursorborder:"",cursorcolor:"#A9A9A9"});
$(".paypal-button .paypal-button-logo").css({'display':'none'});

}]);


app.controller("ReviewController", function(){
	this.review = {};
	this.addReview = function(product) {
		product.reviews.push(this.review);
		this.review = {};
	};
});	




})();




