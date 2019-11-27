class Table {
    constructor(options) {
        this.options = Object.assign({}, options);
        if (options.url !== undefined) {
            this.loadData(options.url)
                .then((data) => {
                    this.data = data;
                    this.createTable(data, this.options)
                })
                .then((data) => {
                    this.render(this.options.node)
                })
        }
    }

    createTable(data, options) {
        const thead = this.createHead(options.colFulNames)
        const trows = this.createBody(data, options)
        this.table = `<table>${thead}${trows}</table>`;
        return this.table
    }

    createHead(data) {
        let theadContent = data.map(item => `<th>${item}</th>`).join('')
        return `<thead>${theadContent}</thead>`
    }

    createRow(data, ListRow) {
        return `<tr>
        ${ListRow.map(colName=>`<td>${localStorage.getItem('Table '+this.options.id+ ' ('+ (this.data.indexOf(data)+1) + ',' + (ListRow.indexOf(colName)+1)+')')||data[colName]}</td>`).join('')} 
            </tr>`;
    }

    createBody(data, options) {
        return data.map(obj => this.createRow(obj, options.colNames)).join('');
    }

    render() {
        document.body.insertAdjacentHTML('beforeend', this.table);
    }

    renderRows(eventTable, sortedRows) {
        eventTable.append(...sortedRows);
    }

    loadData(url) {
        return fetch(url)
            .then(response => response.json())
            .catch(err => console.log(err))
    }

    sortRows(rows, index, sortType) {
        function ASC(a, b) {
            let userA = $(a).children("td").eq(index).text();
            let userB = $(b).children("td").eq(index).text();
            return $.isNumeric(userA) && $.isNumeric(userB) ?
                userA - userB :
                userA.toString().localeCompare(userB);
        }

        function DESC(a, b) {
            let userA = $(a).children("td").eq(index).text();
            let userB = $(b).children("td").eq(index).text();
            return $.isNumeric(userA) && $.isNumeric(userB) ?
                userB - userA :
                userB.toString().localeCompare(userA);
        }
        let sortedRows = rows.sort(sortType == 'asc' ? ASC : DESC);
        return sortedRows;
    }

    getSortType(target) {
        this.dataset = event.target.dataset;
        for (let a of document.querySelectorAll("th")) {
            if (a.textContent != target.textContent) {
                a.dataset['sort'] = '';
            }
        }
        if (this.dataset['sort'] == '' || this.dataset['sort'] == 'desc' || this.dataset['sort'] == undefined) {
            this.dataset['sort'] = 'asc';
        } else if (this.dataset['sort'] == 'asc') {
            this.dataset['sort'] = 'desc'
        }
        return this.dataset['sort'];
    }

    listenEvent() {
        document.addEventListener('click', (event) => {
            let target = event.target;
            let eventTable = this.getCurrentTable(target);
            if (target.tagName == 'TH') {
                let thName = target.textContent;
                let rows = this.getRows(eventTable);
                const sortType = this.getSortType(target);

                this.urlPush(sortType, thName)


                let colIndex = this.options.colFulNames.indexOf(event.target.textContent);
                let sortedRows = this.sortRows(rows, colIndex, sortType);

                this.renderRows(eventTable, sortedRows);
                this.history(eventTable, sortedRows);
            } else if (target.tagName == 'TD') {
                let eventTableId = this.getCurrentTableId(eventTable);
                let columnNumber = target.cellIndex + 1;
                let rowNumber = target.parentNode.rowIndex;

                target.innerHTML = `<input type="text" value=''>`;
                target.classList.add('editable');
                const nodeInput = target.querySelector('input');
                nodeInput.focus();
                nodeInput.addEventListener('keyup', event => {
                    if (event.keyCode === 13) {
                        nodeInput.blur();
                        localStorage['Table ' + eventTableId + ' (' + rowNumber + ',' + columnNumber + ')'] = nodeInput.value
                        nodeInput.parentNode.classList.remove('editable');
                    }
                })
            }
        });
    }

    urlPush(sortType, thName) {
        let initUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        let sortUrl = initUrl + `?sortBy=${thName};sortType=${sortType}`;
        history.pushState({
            thName
        }, ``, sortUrl);
    }

    history(eventTable, sortedRows) {
        window.addEventListener('popstate', function (event) {
            table.listenEvent();
            table.renderRows(eventTable, sortedRows);;
        });
    }

    getCurrentTableId(eventTable) {
        let tables = document.querySelectorAll('table');
        for (let i = 0; i < tables.length; i++) {
            if (tables[i] == eventTable) return i + 1;
        }
    }
    getCurrentTable(target) {
        return target.parentNode.parentNode.parentNode;
    }

    getRows(eventTable) {
        let trs = eventTable.querySelectorAll('tr');
        return Array.from(trs).slice(1);
    }
}

const options = {
    colFulNames: ['ID', 'Name', 'Phone', '@Email'],
    colNames: ['id', 'name', 'phone', 'website'],
    url: 'https://jsonplaceholder.typicode.com/users',
    node: document.body,
    id: 1
}
const options1 = {
    colFulNames: ['ID', 'Name', '@Email'],
    colNames: ['id', 'name', 'website'],
    url: 'https://jsonplaceholder.typicode.com/users',
    node: document.body,
    id: 2
}
const table = new Table(options)
table.listenEvent();
const table1 = new Table(options1)