/***генерация ID топика
 * @returns {string} guid без дефисов
 */
function newTopicId() {
    let guid = createGuid();
    return guid.replace(/-/g, '');
}

class Book {
    constructor(content = '') {
        let _name = "New book";
        this.name = _name;

        let _author = "Guest";
        this.author = _author;

        let _sheets = [];
        this.sheets = _sheets;
        //если текст содержимого не указан, тогда создаем пустой лист
        this._sheetIndex = -1;
        if (content === '') {
            new Sheet(this);
            this._sheetIndex = 0;
        }

        this.loadFromSmartTreeText(content);
    }
    get currentSheet() { return this.sheets[this.sheetIndex]; }
    get sheetIndex() { return this._sheetIndex }
    set sheetIndex(value) { this._sheetIndex = value }

    get asText() { return JSON.stringify(this) }

    toJSON() {
        let obj = {
            name: this.name,
            author: this.author,
            sheets: this.sheets,
            sheetIndex: this.sheetIndex,
        }
        return obj;
    }

    saveToFile(filename) {
        let fs = require('fs');
        fs.writeFile(filename, this.getAsText(), function(err) { if (err) { alert(err) } });
    }

    /*** загрузка карты из текста формата SmartTree
     * @param content JSON-текст формата SmartTree
     */
    loadFromSmartTreeText(content) {
        if (content === '') return;
        let jsonBook = JSON.parse(content);
        this.author = jsonBook.author;
        this.name = jsonBook.name;
        let jsonSheets = JSON.parse(jsonBook.sheets.stringify);
        let _self = this;

        /***функция загрузки топика из массива
         * @param sheet На каком листе 
         * @param fromArray Из какого массива загружать данные
         * @param toTopic Добавить в childrens этого топика
         */
        function loadTopics(sheet, fromArray, toTopic) {
            fromArray.forEach(function(child) {
                let newTopic = new Topic(sheet, toTopic, child.title, child.id);
                newTopic.folded = child.folded;
                if (toTopic.childrens.indexOf(newTopic) === -1)
                    toTopic.childrens.push(newTopic);
                if (child.childrens.length !== 0) {
                    loadTopics(sheet, child.childrens, newTopic);
                }
            })
        }
        /** Функция загрузки соединений 
         * @param sheet лист
         * @fromArray массив данных
         */
        function loadJoins(sheet, fromArray) {
            fromArray.forEach(function(join) {
                let newJoin = new Join(sheet, join.srcTopicId, join.dstTopicId, join.toPoint, join.text);
            })
        }

        //загружаем листы
        jsonSheets.forEach(function(sheet) {
            let bookSheet = new Sheet(sheet); //Создаем лист
            _self.sheets.push(bookSheet); //Добавляем его в нашу схему
            bookSheet.bookId = sheet.id; //Запоминаем предка - возможно потом не пригодится
            bookSheet.name = sheet.name; //Прописываем имя листа

            //создаем корневой топик 
            let sheetRoot = new Topic(bookSheet, null, sheet.root.title, sheet.root.id);
            //и его загружаем дочерние топики
            loadTopics(bookSheet, sheet.root.childrens, sheetRoot);
            //загружаем плавающие топики
            if (bookSheet.detached.length !== 0) {
                bookSheet.detached.forEach(function(flowTopic) {
                    let topic = new Topic(bookSheet, '', flowTopic.title, flowTopic.id);
                    topic.folded = flowTopic.folded;
                    // и его дочерние элементы
                    if (flowTopic.childrens.length !== 0) {
                        loadTopics(bookSheet, flowTopic.childrens, topic);
                    }
                })
            }
            //загружаем соединения
            loadJoins(bookSheet, bookSheet.joins);
        })

    }
}

class Sheet {
    constructor(book) {
        this.statusLoading = true;
        let _detached = [];
        this.detached = _detached;

        // let _listOfTopics = new Map();
        // this.listOfTopics = _listOfTopics;

        let _joins = [];
        this.joins = _joins;

        let _name = 'New sheet';
        this.name = _name;
        let root_ = new Topic(this, null, this.name, '', true);
        this.root = root_;

        let _selectedTopics = [];
        this.selectedTopics = _selectedTopics;

        let _selectedJoins = [];
        this.selectedJoins = _selectedJoins;

        let _focused = this.root;
        this._focused = _focused;

        this._history = [];
        this.history = this._history;
        this._historyPos = -1;

        book.sheets.push(this);
        this.statusLoading = false;
    }
    get asText() { return JSON.stringify(this) }

    get focused() { return this._focused }
    set focused(value) { this._focused = value } //Здесь должен быть вызов прорисовки

    get historyPos() { return this._historyPos }
    set historyPos(value) {
        if ((value > this.history.length - 1) || (value < 0)) return;

        this._historyPos = value;
    }

    addToHistory() {
        if (this.statusLoading) return;
        this.history.push(this.asText);
        this.historyPos = this.historyPos + 1;
    }
    undo() {
        this.historyPos = this.historyPos - 1;
        if (this.historyPos >= 0)
            this.fromJSON(this.history[this._historyPos])
    }
    redo() {
        this.historyPos = this.historyPos + 1;
        if (this.historyPos < this.history.length)
            this.fromJSON(this.history[this._historyPos]);
    }

    deleteSelected() {
        let self = this;
        //Если выделено несколько топиков
        if (self.selectedTopics.length > 0) {
            self.selectedTopics.forEach(function(topic) {
                self.deleteTopic(topic.parent, topic.id);
            })
            self.selectedTopics = [];
        } else if ((self.focused !== null) && (self.focused !== undefined)) {
            //удаляем элемент на котором стоит фокус
            let parent = self.focused.parent;
            self.deleteTopic(parent, self.focused.id)
            self.focused = parent;
        }

        //удаление выделенных джоинов
        if (self.selectedJoins.length > 0) {
            self.selectedJoins.forEach(function(join) {
                self.deleteJoin(join.id)
            })
            self.selectedJoins = [];
        }
    }

    toJSON() {
        let obj = {
            name: this.name,
            root: this.root,
            focused: this.focused.id,
            detached: this.detached,
            joins: this.joins
        }
        return obj;
    }

    /***функция загрузки топика из массива
     * @param fromArray Из какого массива загружать данные
     * @param toTopic Добавить в childrens этого топика
     */
    loadTopics(fromArray, toTopic) {
        let sheet = this;
        fromArray.forEach(function(child) {
            let newTopic = new Topic(sheet, toTopic, child.title, child.id);
            newTopic.folded = child.folded;
            if (toTopic.childrens.indexOf(newTopic) === -1)
                toTopic.childrens.push(newTopic);
            if (child.childrens.length !== 0) {
                sheet.loadTopics(child.childrens, newTopic);
            }
        })
    }

    /** Функция загрузки соединений 
     * @fromArray массив данных
     */
    loadJoins(fromArray) {
        let sheet = this;
        fromArray.forEach(function(join) {
            new Join(sheet, join.srcTopicId, join.dstTopicId, join.toPoint, join.text, join.id);
        })
    }
    fromJSON(content) {
        if ((content === undefined) || (content === "")) return;
        let sheet = this;
        sheet.statusLoading = true;
        //парсим
        let contentSheet = JSON.parse(content);

        //сбрасваем всё на этой странице
        sheet.root = null;
        sheet.joins = [];
        //sheet.listOfTopics = new Map();
        sheet.detached = [];

        //создаем корневой топик 
        sheet.root = new Topic(sheet, null, contentSheet.root.title, contentSheet.root.id, true);
        //и его загружаем дочерние топики
        sheet.loadTopics(contentSheet.root.childrens, sheet.root);

        //загружаем плавающие топики
        if (contentSheet.detached.length !== 0) {
            contentSheet.detached.forEach(function(flowTopic) {
                let topic = new Topic(sheet, '', flowTopic.title, flowTopic.id);
                topic.folded = flowTopic.folded;
                // и его дочерние элементы
                if (flowTopic.childrens.length !== 0) {
                    sheet.loadTopics(flowTopic.childrens, topic);
                }
            })
        }
        //загружаем соединения
        sheet.loadJoins(contentSheet.joins);
        sheet.statusLoading = false;
    }

    findTopic(from, id) {
        let founded = undefined;
        let startFrom = from;
        let sheet = this;
        if ((startFrom === null) || (startFrom === undefined)) { startFrom = sheet.root }
        if (startFrom.id === id) {
            founded = startFrom;
        } else {
            startFrom.childrens.forEach(function(topic) {
                if (topic.id === id) { founded = topic };
            })
        }
        if (founded === undefined) {
            sheet.detached.forEach(function(topic) {
                if (topic.id === id) {
                    founded = topic
                } else {
                    founded = sheet.findTopic(topic, id);
                }
            })
        }
        return founded
    }
    insertTopic(pid, title) {
        let _title = title;
        let parent = this.findTopic(null, pid);
        if (_title === '') _title = 'New topic';
        let topic = new Topic(this, parent, _title);
        return topic;
    }

    deleteTopic(parent, id) {
        let itm = this.findTopic(null, id);
        if ((itm === undefined) || (itm === null)) return;
        if (itm.isRoot) return;
        let deletingTopic;
        let listOfDeletingTopic = [];
        let listOfDeletingJoin = [];
        //рекурсивный проход по дочерним элементам
        function addTopicToDeletingList(topic) {
            if (topic.childrens.length > 0) {
                topic.childrens.forEach(function(child) {
                    addTopicToDeletingList(child);
                })
            }
            listOfDeletingTopic.push(topic);
        }
        //Определяем что за топик собираемся удалить
        parent.childrens.forEach(function(topic) {
                if (topic.id === id) {
                    deletingTopic = topic;
                    idx = parent.indexOf(topic);
                }
            })
            //создадим список всех его потомков
        if (deletingTopic === null) { alert('Топик не найден') } else { addTopicToDeletingList(deletingTopic) }

        //ищем связи
        this.joins.forEach(function(join) {
            listOfDeletingTopic.forEach(function(topic) {
                if ((join.srcTopicId === topic.id) || (join.dstTopicId === topic.id))
                    listOfDeletingJoin.push(join);
            })
        })

        //для начала удалим связи
        listOfDeletingJoin.forEach(function(join) {
            this.joins.splice(this.joins.indexOf(join), 1);
        })
        listOfDeletingJoin = [];

        //теперь удаляем сами топики
        listOfDeletingTopic.forEach(function(topic) {
            let delParent = topic.parent;
            let idx = delParent.childrens.indexOf(topic);
            let detIdx = this.detached.indexOf(topic);
            delParent.childrens.splice(idx, 1);
            this.detached.splice(detIdx, 1);
        })
        this.addToHistory();
    }

    insertJoin(srcTopic, dstTopic, toPoint) {
        let join = new Join(this, srcTopic.id, dstTopic.id, toPoint, '')
        return join;
    }
    deleteJoin(id) {
        let itm;
        this.joins.forEach(function(join) { if (join.id === id) itm = join });
        let idx = this.joins.indexOf(itm);
        this.joins.splice(idx, 1);
        this.addToHistory();
    }
}

class Topic {
    constructor(sheet, parent, title, id = '', is_root = false) {
        if (id == '') {
            this.id = newTopicId(); //генерим id
        } else {
            this.id = id; //присваиваем id - для загрузки из файла
        }

        let _sheet = sheet; //запоминаем лист на котором находимся
        this.sheet = _sheet;

        let _pid = '';
        if ((parent !== null) && (parent !== undefined)) _pid = parent.id; //запоминаем предка
        this._pid = _pid;

        this._folded = false; //true = Дерево свёрнуто
        this.folded = this._folded;

        // this._height = defaultHeight;
        // this.height = this._height;

        // this._width = defaultWidth;
        // this.width = this._width;

        this._title = title;
        let _childrens = [];
        this.childrens = _childrens;

        if (is_root) sheet.root = this;

        //this.sheet.listOfTopics.set(this.id, this);
        if ((parent !== null) && (parent !== "") && (parent !== undefined)) {
            if (parent.childrens.indexOf(this) === -1) { parent.childrens.push(this) }
        } else if (!is_root) {
            //добавляем в список не прикрепленных топиков 
            sheet.detached.push(this)
        }

        let style_ = new TopicStyle();
        this.style = style_;
        this.sheet.addToHistory();
    }
    get title() { return this._title; }
    set title(value) {
        this._title = value;
        this.sheet.addToHistory();
    }

    get pid() { return this._pid; }
    set pid(value) {
        if (this._pid === value) return; //смысла нет, поэтому выходим
        if (this.isChild(value)) return; //нельзя родителем указывать дочерний элемент
        this._pid = value;
        // Если делаем плавающий топик
        if ((value === '') && !this.isRoot()) {
            this.parent.childrens.splice(this.index(), 1);
            this.sheet.detached.push(this);
        }
        this.sheet.addToHistory();
    }

    get folded() { return this._folded }
    set folded(value) {
        if (this._folded === value) return;
        this._folded = value;
        this.sheet.addToHistory();
    }

    toJSON() {
        let obj = {
            id: this.id,
            pid: this.pid,
            title: this.title,
            folded: this.folded,
            childrens: this.childrens,
            style: this.style,
        }
        return obj;
    }

    index() { this.parent.childrens.indexOf(this) }
    isChild(childId) {
        this.childrens.forEach(function(topic) {
            if (topic.id = childId)
                return true
            else if (topic.childrens.length > 0)
                return topic.isChild(childId);
        })
    }
    isRoot() { return this.sheet.root.id === this.id }
    addChild(title = "New topic") { return this.sheet.insertTopic(this.id, title) }
    deleteChild(id) { this.sheet.deleteTopic(this, id) }
}

class Join {
    constructor(sheet, srcTopicId, dstTopicId, toPoint, text, id = "") {

        if (id == "") { this._id = createGuid() } else { this._id = id };


        let _sheet = sheet;
        this.sheet = _sheet;

        this.srcTopicId = srcTopicId;

        let _dstTopicId = dstTopicId;
        this.dstTopicId = _dstTopicId;

        let _toPoint = toPoint;
        this.toPoint = _toPoint;

        this._text = text

        let _style = new BorderStyle();
        this.style = _style;

        sheet.joins.push(this);
    }
    get id() { return this._id }
    set id(value) { this._id = value }

    get text() { return this._text; }
    set text(value) {
        this._text = value;
        this.sheet.addToHistory();
    }

    toJSON() {
        let obj = {
            id: this.id,
            srcTopicId: this.srcTopicId,
            dstTopicId: this.dstTopicId,
            toPoint: this.toPoint,
            text: this.text,
            style: this.style,
        }
        return obj;
    }
}

class BorderStyle {
    constructor(color = 'red', thickness = 3) {
        let color_ = color;
        this.color = color_;

        let thickness_ = thickness;
        this.thickness = thickness_;
    }
}

class AlignHorzEnum {
    LEFT = -1;
    CENTER = 0;
    RIGHT = 1;
}

class AlignVertEnum {
    TOP = -1;
    CENTER = 0;
    BOTTOM = 1;
}

class TextStyle {
    constructor() {
        let color_ = 'black';
        this.color = color_;

        let fontWeight_ = [];
        this.fontWeight = fontWeight_;

        let fontFamily_ = "Calibri";
        this.fontFamily = fontFamily_;

        let fontSize_ = 16;
        this.fontSize = fontSize_;

        let alignByHorz_ = AlignHorzEnum.LEFT;
        this.alignByHorz = alignByHorz_;

        let alignByVert_ = AlignVertEnum.CENTER;
        this.alignByVert = alignByVert_;
    }
}

class TopicStyle {
    constructor() {
        let color_ = 'whitesmmoke';
        this.color = color_;

        let border_ = new BorderStyle('red', 3);
        this.border = border_;

        let radius_ = 3;
        this.raduis = radius_;

        let textStyle_ = new TextStyle();
        this.textStyle = textStyle_;
    }
}

class HistoryItem {
    constructor(action, objectType, object, prop, value) {
        this.action = action;
        this.objectType = objectType;
        this.object = object;
        this.prop = prop;
        this.value = value;
    }
}