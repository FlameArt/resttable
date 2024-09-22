# Smart REST Table on Vue 3 + Vite + Pinia

    // Обработчик после загрузки
    opts.Popup.load = async (row: any) => {

    }

    // Обработчик перед сохранением
    opts.Popup.beforeEdit = async (row: any, table: typeof FlameTable.prototype): Promise<boolean> => {
    }

# Row slot
Слот для цельной строки таблицы
Передан параметр с данными строки `row`

# TableHeaders slot
Слот для строки заголовков
Передан параметр `columns`

### RowSubSlot
Это слот для клика по строке таблицы, если включён параметр `opts.onRowClickOpenSlot`

### Virtual columns
Колонки, которые отправляются на сервер в разделе params и не влияют на выдачу, но могут использоваться для кастомной и тонкой фильтрации

Добавляются через `opts.addVirtual`

# Licenses
MIT