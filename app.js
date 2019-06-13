var budgetController = (function(){
    var Expense = function(id, desc, val){
        this.id = id;
        this.desc = desc;
        this.val = val;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome>0){
            this.percentage = Math.round((this.val/totalIncome)*100);
        }else{
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id, desc, val){
        this.id = id;
        this.desc = desc;
        this.val = val;
    }

    var data = {
        allItems:{
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc:0
        }, 
        budget: 0, 
        percentage: -1
    }

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.val;
        })
        data.totals[type] = sum;
    }

    return{
        addItem: function(type, des, value){
            var newItem, ID;
            if(data.allItems[type].length === 0){
                ID = 0;
            }else{
                ID = data.allItems[type][data.allItems[type].length-1].id+1;
            }
            if(type === "exp"){
                newItem = new Expense(ID, des, value);
            }else if(type === "inc"){
                newItem = new Income(ID, des, value);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            })

            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            calculateTotal("exp");
            calculateTotal("inc");
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0){
                data.percentage =Math.round((data.totals.exp/data.totals.inc)*100);
            }else{
                data.percentage = -1
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPerc;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        }
    }
})();

var UIController = (function(){
    var DomStrings = {
        inputType: ".add__type",
        inputDesc: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn", 
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    }

    var formatNumber = function(num, type){
        var numSplit, int, dec, sign;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");

        int = numSplit[0];

        if(int.length>3){
            int = int.substr(0, int.length-3)+","+int.substr(int.length-3, 3);
        }
        dec = numSplit[1];

        type === "exp" ? sign = "-" : sign = "+";

        return sign+" "+int+"."+dec;
    }

    var nodeListForEach = function(list, callback){
        for(var i=0; i<list.length;i++){
            callback(list[i], i);
        }
    }

    return{
        getInput: function(){
            return{
                type: document.querySelector(DomStrings.inputType).value,
                description: document.querySelector(DomStrings.inputDesc).value,
                value: parseFloat(document.querySelector(DomStrings.inputValue).value)
            }
        }, 
        addListItem: function(obj, type){
            var html, newHtml, element;
            console.log(obj, type)
            if (type === "inc") {
                element = DomStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "exp") {
                element = DomStrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            console.log(element)
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.desc);
            newHtml = newHtml.replace('%value%',formatNumber(obj.val, type));
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorID){
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DomStrings.inputDesc+", "+DomStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((element, index, array) => {
                element.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = "inc": type = "exp";

            document.querySelector(DomStrings.budgetLabel).textContent =formatNumber(obj.budget, type);
            document.querySelector(DomStrings.incomeLabel).textContent =formatNumber(obj.totalInc,"inc");
            document.querySelector(DomStrings.expensesLabel).textContent =formatNumber(obj.totalExp,"exp");

            if(obj.percentage>0){
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage+"%";
            }else{
                document.querySelector(DomStrings.percentageLabel).textContent = "---";
            }
        },

        displayPercentages: function(percentages){
            var fields;
            fields = document.querySelectorAll(DomStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index){
                if(percentages[index]>0){
                    current.textContent = percentages[index] +"%";
                }else{
                    current.textContent = "---";
                }
            })
        },

        displayMonth: function(){
            var now, year, month, months;

            now = new Date();
            months = ["Jan", "Feb", "March", "April", "May", "June", "July", "August", "September", "October", "Nov", "Dec"]
            month = now.getMonth();
            month = months[month];
            year = now.getFullYear();
            document.querySelector(DomStrings.dateLabel).textContent =month+" "+year;
        },

        changedType: function(){
            var fields;

            fields = document.querySelectorAll(
                DomStrings.inputType+","+DomStrings.inputDesc+","+DomStrings.inputValue
            )

            nodeListForEach(fields, function(cur){
                cur.classList.toggle("red-focus");
            });

            document.querySelector(DomStrings.inputBtn).classList.toggle("red");
        },

        getDomStrings: function(){
            return DomStrings;
        }
    }
})();

var controller = (function(budgetCtrl, UIctrl){

    var setupEventListeners = function(){
        var Dom = UIctrl.getDomStrings();
        document.querySelector(Dom.inputBtn).addEventListener("click",ctrlAddItem);

        document.addEventListener("keypress",function(event){
            if(event.keyCode === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(Dom.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(Dom.inputType).addEventListener("change", UIctrl.changedType);
    }

    var updateBudget = function(){
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        UIctrl.displayBudget(budget);
    }

    var updatePercentages = function(){
        budgetCtrl.calculatePercentages();

        var percentages = budgetCtrl.getPercentages();
        UIctrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function(){
        var input, newItem;
        input = UIctrl.getInput();
        if(input.description !== "" && !isNaN(input.value) && input.value>0){
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            UIctrl.addListItem(newItem, input.type);
            UIctrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    }
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID = itemID.split("-");
            type = splitID[0]
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);

            UIctrl.deleteListItem(itemID);
            updateBudget();
            updatePercentages();
        }
    }

    return{
        init: function(){
            UIctrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
            UIctrl.displayMonth();
        }
    }

})(budgetController, UIController);

controller.init();