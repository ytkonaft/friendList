function vkApi(method, options) {
    if (!options.v) {
        options.v = '5.64';
    }

    return new Promise((resolve, reject) => {
        VK.api(method, options, data => {
            if (data.error) {
                reject(new Error(data.error.error_msg));
            } else {
                resolve(data.response);
            }
        });
    });
}

function vkInit() {
    return new Promise((resolve, reject) => {
        VK.init({
            apiId: 6063816
        });

        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 2);
    });
}



var template = `
{{#each items}}
    <div class="friend">
        <img src="{{photo_100}}">
        <span>{{first_name}} {{last_name}}</span>
        <button></button>
    </div>
{{/each}}
`;
var templateFn = Handlebars.compile(template),
    trigger = false,
    elemOfsetTop,
    elemOfsetLeft,
    toSort = false,
    toFrList = false;


new Promise(resolve => window.onload = resolve)
    .then(() => vkInit())
    .then(() => vkApi('users.get', {
        name_case: 'gen'
    }))
    .then(() => vkApi('friends.get', {
        fields: 'photo_100'
    }))
    .then(response => {
        if ((localStorage.getItem('friendsList')) || (localStorage.getItem('sortList'))) {
            friends.innerHTML = templateFn(JSON.parse(localStorage.getItem('friendsList')));
            sort.innerHTML = templateFn(JSON.parse(localStorage.getItem('sortList')));
        } else {
            friends.innerHTML = templateFn(response);
        }
    })
    .catch(e => alert('Ошибка: ' + e.message));

friends.addEventListener('click', (e) => buttonEvent(e.target, sort)); // Обработчик нажатия кнопок первого списка
sort.addEventListener('click', (e) => buttonEvent(e.target, friends)); // Обработчик нажатия кнопок второго списка
save.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.clear();
    localStorage.setItem('friendsList', createObj(friends));
    localStorage.setItem('sortList', createObj(sort));

});


function createObj(par) {
    var arr = [];
    for (var i = 0; i < par.children.length; i++) {
        var name = par.children[i].children[1].innerText;
        arr.push({
            'first_name': name.split(' ')[1],
            'last_name': name.split(' ')[0],
            'photo_100': par.children[i].children[0].src
        })
    }
    return JSON.stringify({
        'count': par.children.length,
        'items': arr
    });
}

friendsTable.addEventListener('mousedown', function(e) {
    var target = e.target;
    if (target.tagName !== "BUTTON") {
        while (target != friendsTable) {
            if (target.className == 'friend') {
                createSpirit(target, e);
                target.classList.add('draggble');
                if (target.parentNode.id == 'friends') {
                    toSort = true;
                } else if (target.parentNode.id == 'sort') {
                    toFrList = true;
                }
                trigger = true;
                return;
            }
            target = target.parentNode;
        }
    }
});

friendsTable.addEventListener('keyup', function(e) {
    if (e.target.tagName == 'INPUT') {
        var where = document.getElementById(e.target.dataset.rel);
        for (var keu of where.children) {
            var word = e.target.value.toLowerCase(),
                str = keu.children[1].innerText.toLowerCase();
            if (str.indexOf(word) >= 0) {
                keu.classList.remove('hidden');
            } else {
                keu.classList.add('hidden')
            }
            if (e.target.value == '') {
                keu.classList.remove('hidden');

            }
        }
    }
});
friendsTable.addEventListener('mouseup', function(e) {
    if (trigger) {
        var drugelem = document.getElementsByClassName('draggble')[0];
        friendsTable.removeChild(document.getElementsByClassName('fx')[0]);
        drugelem.classList.remove('draggble');
        if (toSort) {
            sort.addEventListener('mouseenter', moveElem(drugelem, sort));
            sort.removeEventListener('mouseenter', moveElem)
            toSort = false;
        }
        if (toFrList) {
            friends.addEventListener('mouseenter', moveElem(drugelem, friends));
            friends.removeEventListener('mouseenter', moveElem)
            toFrList = false;
        }
        trigger = false;
    }
    return
});




friendsTable.addEventListener('mousemove', function(e) {
    if (trigger) {
        var elem = document.getElementsByClassName('fx')[0];
        elem.style.top = e.clientY - elemOfsetTop + 'px';
        elem.style.left = e.clientX - elemOfsetLeft + 'px';
    }
})




function createSpirit(itm, e) {
    var elem = friendsTable.appendChild(itm.cloneNode(true));
    elem.style.width = itm.offsetWidth + 'px';
    elem.style.top = itm.getBoundingClientRect().top - 10 + 'px';
    elem.style.left = itm.getBoundingClientRect().left + 'px';
    elem.classList.add('fx');
    elemOfsetTop = e.clientY - elem.offsetTop + 10;
    elemOfsetLeft = e.clientX - elem.offsetLeft;
}


function moveElem(itm, where) {
    var elem = friendsTable.appendChild(itm.cloneNode(true));
    where.appendChild(elem);
    itm.remove();
}




function buttonEvent(elem, where) {
    if (elem.tagName == "BUTTON") {
        while (elem != friendsTable) {
            if (elem.className == 'friend') {
                moveElem(elem, where);
                elem.remove();
                return;
            }
            elem = elem.parentNode;
        }
    }
};