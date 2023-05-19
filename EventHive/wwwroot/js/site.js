
const EventsGridLayout = '/templates/events-grid.html'

// pages URIs
const EventsGroupUri = '/events'
const EventsIndexUri = '/index.html'
const EventDetailsUri = '/event.html'

// api URIs
const ApiUri = '/api'
const EventsUri = '/Events'
const CategoriesUri = '/Categories'
const TicketVaultsUri = '/TicketVaults'
const TicketsUri = '/Tickets'
const TicketsPurchaseUri = '/Purchase'
const PromoCodesUri = '/PromoCodes'

// query parameters
const queryString = location.search
const params = new URLSearchParams(queryString)


function _operationFailedAlert() 
{
    alert('Operation failed.')
}

function renderEventsGrid(wrapperId) 
{
    let wrapper = document.getElementById(wrapperId)
    if (wrapper == null) 
    {
        console.error('Cannot find wrapper with id ' + wrapperId)
    }
    else 
    {
        fetch(EventsGridLayout)
            .then(request => request.text())
            .then(text => wrapper.innerHTML = text)
        
        fetch(ApiUri + EventsUri, {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => _renderEvents(document.getElementById('events-grid'), data))
            .catch(reason => console.error(reason.message))
    }
}

function _renderEvents(grid, data)
{
    data.forEach(event => {
        
        let eventWrapper = document.createElement('div')
        eventWrapper.className = 'event-wrapper'
        
        let eventInner = document.createElement('div')
        eventInner.className = 'event-inner'
        eventWrapper.appendChild(eventInner)
        
        let imageWrapper = document.createElement('div')
        imageWrapper.className = 'event-image'
        eventInner.appendChild(imageWrapper)
        
        let imageCaption = document.createElement('h5')
        imageCaption.style = "color: white;"
        imageCaption.innerText = "Event's image"
        imageWrapper.append(imageCaption)
        
        let nameLink = document.createElement('a')
        nameLink.className = 'event-name-link'
        nameLink.href = EventsGroupUri + EventDetailsUri + '?id=' + event.id
        eventInner.appendChild(nameLink)
        
        let name = document.createElement('h4')
        name.innerText = event.name
        nameLink.appendChild(name)
        
        let description = document.createElement('p')
        description.innerText = event.description
        eventInner.appendChild(description)
        
        let categories = document.createElement('div')
        categories.className = 'event-categories'
        eventInner.appendChild(categories)
        
        // retrieve categories
        renderCategories(event.id, categories)
        
        grid.appendChild(eventWrapper)
    })
}


function renderEvent(id = null) 
{
    // insert event's: 
    //  name into .insert-event-name
    //  dateTime into .insert-event-date-time
    //  description into .insert-event-description
    //  categories into #insert-event-categories
    
    if (id == null) 
    {
        // retrieve id if not provided
        let idStr = params.get("id")
        if (idStr == null) 
        {
            // todo: you could replace it with redirect to 4xx
            console.error('Cannot retrieve event\'s id.')
            return
        }
        
        id = parseInt(params.get("id"))
    }

    // fetch event
    fetch(ApiUri + EventsUri + '/' + id, {
        method: 'GET'
    })
        .then(request => request.json())
        .then(data => _renderEvent(data))
        .catch(reason => console.error(reason.message))
}


function _renderEvent(data) 
{
    document.title = data.name + ' — EventHive'
    
    // name
    let nameElements = document.getElementsByClassName('insert-event-name')
    for (let i = 0; i < nameElements.length; ++i)
    {
        nameElements[i].innerHTML = data.name
    }

    // description
    let descriptionElements = document.getElementsByClassName('insert-event-description')
    for (let i = 0; i < descriptionElements.length; ++i)
    {
        descriptionElements[i].innerText = data.description
    }

    // date time
    let dateTimeElements = document.getElementsByClassName('insert-event-date-time')
    for (let i = 0; i < dateTimeElements.length; ++i)
    {
        dateTimeElements[i].innerText = data.dateAndTime ?? ' ... soon'
    }
    
    renderCategories(data.id)
    renderTicketVaults(data.id)
}

function renderCategories(eventId, categoriesWrapper = null)
{
    /*
    * Insert links to categories into categoriesWrapper if provided,
    * otherwise get element with id insert-event-categories and insert
    * the links into it.
    * */
    if (categoriesWrapper == null) 
    {
        categoriesWrapper = document.getElementById('insert-event-categories')
        if (categoriesWrapper == null) 
            return
    }
    
    fetch(ApiUri + EventsUri + '/' + eventId + '/categories')
        .then(response => response.json())
        .then(categoriesCollection => categoriesCollection.forEach(category => {
            let categoryLink = document.createElement('a')
            categoryLink.href = EventsGroupUri + EventsIndexUri + '?category=' + category.id
            categoryLink.innerText = category.name
            categoryLink.className = 'btn btn-primary btn-sm'
            categoriesWrapper.appendChild(categoryLink)
        }))
}

function renderTicketVaults(eventId) {
    /*
    * Insert grid with Ticket Vaults into #insert-ticket-vaults-grid
    * */

    let gridWrapper = document.getElementById('insert-ticket-vaults-grid')
    if (gridWrapper == null)
        return

    let grid = document.createElement('div')
    grid.style = "display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); padding: 15px"
    gridWrapper.appendChild(grid)


    fetch(ApiUri + TicketVaultsUri + '?eventid=' + eventId)
        .then(response => response.json())
        .then(collection => _renderTicketVaults(grid, collection))
        .catch(reason => {
            console.log(reason.message)
        })
}


function _renderTicketVaults(grid, collection, renderControls=false)
{
    let ticketsAvailable = false
    if (collection.length === 0) {
        let cardWrapper = document.createElement('div')
        cardWrapper.className = 'ticket-vault-card-wrapper'
        grid.appendChild(cardWrapper)

        let pMessage = document.createElement('p')
        pMessage.innerText = 'No tickets available'
        cardWrapper.appendChild(pMessage)

    } else {
        let selectElement = document.getElementById('ticket-vault-select')
        
        collection.forEach(ticketVault => {

            let cardWrapper = document.createElement('div')
            cardWrapper.className = 'ticket-vault-card-wrapper'
            grid.appendChild(cardWrapper)

            let card = document.createElement('div')
            card.className = 'card bg-light mb-3'
            card.style = 'width: 20rem; max-width: 30rem'
            cardWrapper.appendChild(card)

            let title = document.createElement('h4')
            title.className = 'card-header'
            title.innerText = ticketVault.title
            card.appendChild(title)

            let cardBody = document.createElement('div')
            cardBody.className = 'card-body'
            card.appendChild(cardBody)

            let pAvailable = document.createElement('p')
            pAvailable.innerText = 'Tickets left: ' + ticketVault.ticketsLeft + '/' + ticketVault.totalTickets
            cardBody.appendChild(pAvailable)

            let pPrice = document.createElement('p')
            pPrice.innerText = 'Price: ' + ticketVault.price
            cardBody.appendChild(pPrice)
            
            let controls = document.createElement('div')
            cardBody.appendChild(controls)
            controls.style = 'display: flex; justify-content: end; gap: 10px'
            
            if (renderControls)
            {
                let editButtonWrapper = document.createElement('a')
                controls.appendChild(editButtonWrapper)
                editButtonWrapper.href = '/ticketvaults/edit.html?id=' + ticketVault.id

                let editButton = document.createElement('button')
                editButtonWrapper.appendChild(editButton)
                editButton.className = 'btn btn-primary btn-sm'
                editButton.innerText = 'Edit'

                let deleteButton = document.createElement('button')
                controls.appendChild(deleteButton)
                deleteButton.className = 'btn btn-primary btn-sm'
                deleteButton.innerText = 'Delete'
                deleteButton.onclick = () => deleteTicketVault(ticketVault.id)
            }
            
            if (selectElement && ticketVault.ticketsLeft > 0) {
                let optionElement = document.createElement('option')
                optionElement.value = ticketVault.id
                optionElement.innerText = ticketVault.title
                selectElement.appendChild(optionElement)
                ticketsAvailable = true
            }
        })
    }
    
    if (ticketsAvailable) {
        let purchaseTicketFormWrapper = document.getElementById('purchase-ticket-form-wrapper')
        if (purchaseTicketFormWrapper != null)
            purchaseTicketFormWrapper.hidden = false
    }
}

function validateEventName()
{
    let inputElement = document.getElementById("event-name")
    if (!inputElement)
    {
        console.error('Cannot access #event-name element')
        return false
    }
    let value = inputElement.value
    
    // validation
    if (value.trim().length === 0) 
    {
        inputElement.classList.remove('is-valid')
        inputElement.classList.add('is-invalid')
        return false
    }
    else
    {
        inputElement.classList.remove('is-invalid')
        inputElement.classList.add('is-valid')
    }
    return true
}

function validateEventDate()
{
    let inputElement = document.getElementById("event-date")
    let errorElement = document.getElementById('event-date-error')
    if (!inputElement || !errorElement)
    {
        console.error('Cannot access #event-date or #event-date-error element')
        return false
    }
    let value = inputElement.value

    // validation
    try {
        if (value.trim().length !== 0)
        {
            const pattern = /^\d\d\d\d-\d\d-\d\d$/;

            if (!pattern.test(value))
                throw 'Date is in a wrong format; use YYYY-MM-DD.'

            let date = Date.parse(value)
            if (!date)
                throw 'The date is incorrect.'

            if (date < Date.now())
                throw 'The event cannot be held in the past.'

            let inAYear = new Date()
            inAYear.setFullYear(inAYear.getFullYear() + 1)
            if (date >= inAYear)
                throw 'The event cannot be held so far in the future...'
        }

        inputElement.classList.remove('is-invalid')
        inputElement.classList.add('is-valid')
    }
    catch (s) {
        errorElement.innerText = s
        inputElement.classList.remove('is-valid')
        inputElement.classList.add('is-invalid')
        return false
    }
    return true
}

function validateEventTime()
{
    let inputElement = document.getElementById("event-time")
    let errorElement = document.getElementById('event-time-error')
    if (!inputElement || !errorElement)
    {
        console.error('Cannot access #event-time or #event-time-error element')
        return false
    }
    let value = inputElement.value

    // validation
    try {
        let dateElement = document.getElementById("event-date")
        if (value.trim().length !== 0)
        {
            if (!dateElement || dateElement.value.trim().length === 0 || !validateEventDate())
                throw 'Enter date first.'
            
            const pattern = /^\d\d:\d\d$/;

            if (!pattern.test(value))
                throw 'Time is in a wrong format; use hh:mm.'

            let hour = parseInt(value.slice(0,2))
            let minutes = parseInt(value.slice(3, 5))

            if (hour > 23 || minutes > 59)
                throw 'Time is invalid.'
        }

        inputElement.classList.remove('is-invalid')
        inputElement.classList.add('is-valid')
    }
    catch (s) {
        errorElement.innerText = s
        inputElement.classList.remove('is-valid')
        inputElement.classList.add('is-invalid')
        return false
    }
    return true
}

function validateEventDateAndTime()
{
    let inputElement = document.getElementById("event-date-and-time")
    let errorElement = document.getElementById('event-date-and-time-error')
    if (!inputElement || !errorElement)
    {
        console.error('Cannot access #event-time or #event-time-error element')
        return false
    }
    let value = inputElement.value

    // validation
    try {
        let dateElement = document.getElementById("event-date")
        if (value.trim().length !== 0)
        {
            let pattern = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d$/
            if (!pattern.test(value))
                throw 'Wrong format; example: 2029-12-19T18:30.'
            
            let date = Date.parse(value)
            if (date < Date.now())
                throw 'The event cannot be held in the past.'

            let inAYear = new Date()
            inAYear.setFullYear(inAYear.getFullYear() + 1)
            if (date >= inAYear)
                throw 'The event cannot be held so far in the future...'
        }

        inputElement.classList.remove('is-invalid')
        inputElement.classList.add('is-valid')
    }
    catch (s) {
        errorElement.innerText = s
        inputElement.classList.remove('is-valid')
        inputElement.classList.add('is-invalid')
        return false
    }
    return true
}

function addEvent()
{
    // validate all fields first so that all errors are displayed
    let a = validateEventName()
    let b = validateEventDate()
    let c = validateEventTime()
    
    if (!a || !b || !c)
        return
    
    let event = {
        'name': document.getElementById("event-name").value,
        'description': document.getElementById("event-description").value
    }
    
    if (document.getElementById("event-date").value.trim().length > 0)
        event['dateAndTime'] = document.getElementById("event-date").value + 'T' + document.getElementById("event-time").value + ':00'
    
    fetch(ApiUri + EventsUri, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify(event)
    })
        .then(async response => {
            let data = await response.json()
            if (response.ok) 
            {
                document.location.replace('/events/event.html?id=' + data.id)
            }
            else 
            {
                _renderCreateEventError(data)
            }
        })
}

function saveEvent()
{
    let a = validateEventName()
    let b = validateEventDateAndTime()

    if (!a || !b)
        return

    let event = {
        id: params.get('id'),
        name: document.getElementById("event-name").value,
        description: document.getElementById("event-description").value,
        dateAndTime: Date.parse(document.getElementById('event-date-and-time').value)
    }

    fetch(ApiUri + EventsUri + '/' + event.id, {
        method: "PUT",
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify(event)
    })
        .then(async response => {
            if (response.ok)
            {
                document.location.replace('/events/event.html?id=' + event.id)
            }
            else
            {
                console.log(JSON.stringify(event))
                let data = await response.json()
                if (data.errors && data.errors.Name && data.errors.Name.length > 0)
                    _renderCreateEventError(data.errors.Name[0])
                else
                    _renderCreateEventError(data.title)
            }
        })
        .catch(reason => console.error(reason.message))
}

function _renderCreateEventError(message = 'Cannot create event.')
{
    let element = document.getElementById('create-event-error')
    if (!element)
        console.error(message)
    else
        element.innerText = message
}

function renderEditEventPage()
{
    let nameElement = document.getElementById('event-name')
    let dateAndTimeElement = document.getElementById('event-date-and-time')
    let descriptionElement = document.getElementById('event-description')
    
    let eventId = params.get('id')
    if (!eventId)
        document.location.replace('/events/index.html')
    
    // render event's data
    fetch(ApiUri + EventsUri + '/' + eventId)
        .then(async response => {
            if (!response.ok) {
                document.location.replace('/events/index.html')
            } else {
                let data = await response.json()
                nameElement.value = data.name
                dateAndTimeElement.value = data.dateAndTime ? data.dateAndTime.slice(0, 4+1+2+1+2+1+2+1+2) : ''
                descriptionElement.value = data.description
            }
        })
        .catch(reason => console.error(reason.message))
    
    // render ticket vaults
    let grid = document.getElementById('ticket-vault-grid')
    fetch(ApiUri + TicketVaultsUri + '?eventid=' + eventId)
        .then(async response => {
            let data = await response.json()
            if (!response.ok) {
                console.error('Cannot retrieve ticket vaults')
                console.log(data)
            }
            else
            {
                _renderTicketVaults(grid, data, true)
            }
        })
    
}

function validateTicketVaultTitle()
{
    let inputElement = document.getElementById("ticket-vault-title")
    if (!inputElement)
    {
        console.error('Cannot access #ticket-vault-title element')
        return false
    }
    let value = inputElement.value

    // validation
    if (value.trim().length === 0)
    {
        inputElement.classList.remove('is-valid')
        inputElement.classList.add('is-invalid')
        return false
    }
    else
    {
        inputElement.classList.remove('is-invalid')
        inputElement.classList.add('is-valid')
    }
    return true
}

function validateTicketVaultPrice()
{
    let inputElement = document.getElementById("ticket-vault-price")
    let errorElement = document.getElementById('ticket-vault-price-error')
    let wrapperElement = document.getElementById('ticket-vault-price-wrapper')
    if (!inputElement || !errorElement || !wrapperElement)
    {
        console.error('Cannot access #ticket-vault-price or #ticket-vault-price-error or #ticket-vault-price-wrapper element')
        return false
    }
    let value = inputElement.value

    // validation
    try {
        
        let pattern = /^(\d+(\.\d\d)?)$/
        if (!pattern.test(value))
            throw 'Wrong format; example: 49.89.'

        if (parseInt(value) < 0)    // thought it shouldn't ever strike
            throw 'Price cannot be negative'
        
        wrapperElement.classList.remove('is-invalid')
        wrapperElement.classList.add('is-valid')
        inputElement.classList.remove('is-invalid')
        inputElement.classList.add('is-valid')
        
    }
    catch (s) {
        errorElement.innerText = s
        wrapperElement.classList.remove('is-valid')
        wrapperElement.classList.add('is-invalid')
        inputElement.classList.remove('is-valid')
        inputElement.classList.add('is-invalid')
        return false
    }
    return true
}

function validateTicketVaultTotal()
{
    let inputElement = document.getElementById("ticket-vault-total")
    let errorElement = document.getElementById('ticket-vault-total-error')
    if (!inputElement || !errorElement)
    {
        console.error('Cannot access #ticket-vault-total or #ticket-vault-total-error element')
        return false
    }
    let value = inputElement.value

    // validation
    try {
        if (value.trim().length !== 0)
        {
            let pattern = /^\d+$/
            if (!pattern.test(value))
                throw 'Wrong format; example: 250.'

            if (parseInt(value) < 0)    // thought it shouldn't ever strike
                throw 'Number of tickets cannot be negative'
        }
        inputElement.classList.remove('is-invalid')
        inputElement.classList.add('is-valid')

    }
    catch (s) {
        errorElement.innerText = s
        inputElement.classList.remove('is-valid')
        inputElement.classList.add('is-invalid')
        return false
    }
    return true
}

function validateTicketVaultLeft()
{
    let inputElement = document.getElementById("ticket-vault-left")
    let errorElement = document.getElementById('ticket-vault-left-error')
    if (!inputElement || !errorElement)
    {
        console.error('Cannot access #ticket-vault-left or #ticket-vault-left-error element')
        return false
    }
    let value = inputElement.value

    // validation
    try {
        if (value.trim().length !== 0)
        {
            let total = parseInt(document.getElementById('ticket-vault-total').value)
            
            if (!validateTicketVaultTotal() || isNaN(total))
                throw 'Enter total number of tickets first.'
            
            let pattern = /^\d+$/
            if (!pattern.test(value))
                throw 'Wrong format; example: 125.'

            if (parseInt(value) < 0)    // thought it shouldn't ever strike
                throw 'Number of tickets cannot be negative.'
            
            if (parseInt(value) > total)
                throw 'Cannot be grater than total number of tickets.'
        }
        inputElement.classList.remove('is-invalid')
        inputElement.classList.add('is-valid')

    }
    catch (s) {
        errorElement.innerText = s
        inputElement.classList.remove('is-valid')
        inputElement.classList.add('is-invalid')
        return false
    }
    return true
}

function addTicketVault()
{
    let a = validateTicketVaultTitle()
    let b = validateTicketVaultPrice()
    let c = validateTicketVaultTotal()
    let d = validateTicketVaultLeft()
    
    if (!a || !b || !c || !d)
        return
    
    let ticketVault = {
        eventId: parseInt(params.get('id')),
        title: document.getElementById('ticket-vault-title').value,
        price: parseFloat(document.getElementById('ticket-vault-price').value),
        totalTickets: parseInt(document.getElementById('ticket-vault-total').value),
        ticketsLeft: parseInt(document.getElementById('ticket-vault-left').value)
    }
    
    console.log(JSON.stringify(ticketVault))
    
    fetch(ApiUri + TicketVaultsUri,
        {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify(ticketVault)
        })
        .then(async response => {
            let data = await response.json()
            if (response.ok)
            {
                document.location.reload()
            }
            else
            {
                if (data.errors && data.errors.Name && data.errors.Name.length > 0)
                    _renderCreateTicketVaultError(data.errors.Name[0])
                else
                    _renderCreateTicketVaultError(data.title)
            }
        })
        .catch(reason => console.error(reason))
}

function deleteTicketVault(id, reload= true)
{
    if (!confirm('You really want to delete it?'))
        return
    fetch(ApiUri + TicketVaultsUri + '/' + id, {
        method: 'DElETE'
    })
        .then(async response => {
            if (response.ok) {
                document.location.reload()
            } else {
                console.error(await response.text())
            }
        })
}

function _renderCreateTicketVaultError(message = 'Cannot create event.')
{
    let element = document.getElementById('create-ticket-vault-error')
    if (!element)
        console.error(message)
    else
        element.innerText = message
}

function purchaseTicket()
{
    let ticketVaultId = parseInt(document.getElementById('ticket-vault-select').value)
    let holder = document.getElementById('ticket-vault-holder').value
    let promoCode = document.getElementById('ticket-vault-promo-code').value
    
    let tickerOrder = null
    if (promoCode.trim().length > 0)
    {
        tickerOrder = {
            ticketvaultid: ticketVaultId,
            holder: holder,
            promocode: promoCode
        };
    }
    else
    {
        tickerOrder = {
            ticketvaultid: ticketVaultId,
            holder: holder
        };
    }
    
    fetch(ApiUri + TicketsUri + TicketsPurchaseUri + '/' + ticketVaultId, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify(tickerOrder)
    })
        .then(response => response.json())
        .then(data => {
            if (typeof data === typeof '')
            {
                let errorLabel = document.getElementById('purchase-ticket-error')
                errorLabel.innerText = data
            }
            else
            {
                document.location.replace('/tickets/ticket.html?id=' + data.id)
            }
        })
        .catch(reason => {
            console.error(reason.message)
        })
}


function renderTicket(redirectPath = null)
{
    /*
    * Insert:
    *   - ticket vault title into .insert-ticket-vault-title
    *   - ticket holder into .insert-ticket-holder
    *   - ticket purchase time into .insert-ticket-purchase-time
    *   - paid price into .insert-paid-price
    * 
    * */
    
    // get ticket id
    let ticketId = params.get('id')
    if (!ticketId)
        return
    
    // get and render ticket
    fetch(ApiUri + TicketsUri + '/' + ticketId)
        .then(async response => {
            if (response.ok) {
                _renderTicket(await response.json(), redirectPath)
            } else {
                document.location.replace('/index.html')
            }
        })
        .catch(reason =>
        {
            document.location.replace('/index.html')
        })
}

function _renderTicket(data, redirectPath = null)
{
    /*
    * Attention: method contains spaghetti, bon appétit.
    * */
    
    // retrieve fields
    let titleElements = document.getElementsByClassName('insert-event-name')
    let typeElements = document.getElementsByClassName('insert-ticket-vault-title')
    let holderElements = document.getElementsByClassName('insert-ticket-holder')
    let timeElements = document.getElementsByClassName('insert-ticket-purchase-time')
    let priceElements = document.getElementsByClassName('insert-paid-price')
    let codeElements = document.getElementsByClassName('insert-ticket-code')
    
    for (let i = 0; i < holderElements.length; ++i) {
        holderElements[i].value = data.holder.length > 0 ? data.holder : 'unknown'
    }
    for (let i = 0; i < timeElements.length; ++i) {
        timeElements[i].value = data.purchaseTime
    }
    for (let i = 0; i < codeElements.length; ++i) {
        codeElements[i].value = data.id
    }
    for (let i = 0; i < priceElements.length; ++i) {
        priceElements[i].value = data.paidPrice
    }

    // retrieve ticket vault
    fetch(ApiUri + TicketVaultsUri + '/' + data.ticketVaultId)
        .then(response => response.json())
        .then(data => {
            
            for (let i = 0; i < typeElements.length; ++i) {
                typeElements[i].value = data.title
            }
            
            // retrieve event
            fetch(ApiUri + EventsUri + '/' + data.eventId)
                .then(response => response.json())
                .then(data => {
                    for (let i = 0; i < titleElements.length; ++i) {
                        titleElements[i].value = data.name
                    }

                })
                .catch(reason =>
                {
                    if (redirectPath)
                        document.location.replace(redirectPath)
                    else
                        console.error('Cannot retrieve event with id ' + data.eventId)
                })
        })
        .catch(reason =>
        {
            if (redirectPath)
                document.location.replace(redirectPath)
            else
                console.error('Cannot retrieve ticket vault with id ' + data.ticketVaultId)
        })
}

function goToTicket()
{
    try {
        
        let ticketId = parseInt(document.getElementById('ticket-id').value)
        if (!ticketId)
            throw Error()
        
        fetch(ApiUri + TicketsUri + '/' + ticketId)
            .then(response => {
                if (response.ok)
                    document.location.replace('/tickets/ticket.html?id=' + ticketId)
                else
                    _processTicketCheckError()
            })
            .catch(reason => _processTicketCheckError())
    }
    catch {
        _processTicketCheckError()
    }
}

function _processTicketCheckError() {
    let errorLabel = document.getElementById('check-ticket-error')
    if (errorLabel) {
        errorLabel.innerText = 'Cannot find the ticket'
    } else {
        console.error('Cannot find the ticket, cannot find #check-ticket-error label.')
    }
}

function deleteTicket(redirectPath = '/index.html') {
    if (confirm('Are you sure you want to delete the ticket?')) {
        fetch(ApiUri + TicketsUri + '/' + params.get('id'), {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    document.location.replace(redirectPath)
                }
                else
                    _operationFailedAlert()
            })
            .catch(reason => console.error(reason.message))
    }
}

async function renderEditTicketVaultPage(redirectPath = '/events/index.html') {
    let tvId = parseInt(params.get('id'))
    if (!tvId)
        document.location.replace(redirectPath)

    let eventNameElement = document.getElementById('event-name')
    let eventIdElement = document.getElementById('event-id')
    let titleElement = document.getElementById('ticket-vault-title')
    let priceElement = document.getElementById('ticket-vault-price')
    let totalElement = document.getElementById('ticket-vault-total')
    let leftElement = document.getElementById('ticket-vault-left')
    let promoCodesTable = document.getElementById('promo-codes-table-body')

    // retrieve ticket vault
    let ticketVault
    await fetch(ApiUri + TicketVaultsUri + '/' + tvId)
        .then(async response => {
            ticketVault = await response.json()
            if (!response.ok)
                document.location.replace(redirectPath)
        })
        .catch(reason => console.error(reason.message))

    // retrieve event
    let eventId = ticketVault.eventId
    let event
    await fetch(ApiUri + EventsUri + '/' + eventId)
        .then(async response => {
            event = await response.json()
            if (!response.ok)
                document.location.replace(redirectPath)
        })
        .catch(reason => console.error(reason.message))
    
    // retrieve promo codes
    let promoCodes
    await fetch(ApiUri + PromoCodesUri + '?ticketVaultId=' + ticketVault.id)
        .then(async response => {
            promoCodes = await response.json()
            if (!response.ok)
                document.location.replace(redirectPath)
        })
        .catch(reason => console.error(reason.message))
    
    // insert data
    eventNameElement.value = event.name
    eventIdElement.value = event.id
    titleElement.value = ticketVault.title
    priceElement.value = ticketVault.price
    totalElement.value = ticketVault.totalTickets
    leftElement.value = ticketVault.ticketsLeft
    promoCodes.forEach(promoCode =>
    {
        let tr = document.createElement('tr')
        promoCodesTable.appendChild(tr)
        
        let code = document.createElement('th')
        code.scope = 'row'
        code.innerText = promoCode.code
        tr.appendChild(code)
        
        let discount = document.createElement('th')
        discount.scope = 'row'
        discount.style = 'text-align: center'
        discount.innerText = (parseFloat(promoCode.discount) * 100).toFixed(0) + '%'
        tr.appendChild(discount)

        let buttonWrapper = document.createElement('th')
        buttonWrapper.scope = 'row'
        buttonWrapper.style = 'text-align: right'
        tr.appendChild(buttonWrapper)
        
        let button = document.createElement('button')
        button.className = 'btn btn-outline-danger btn-sm'
        button.innerText = 'delete'
        button.onclick = () => deletePromoCode(promoCode.id)
        buttonWrapper.appendChild(button)
    })
    if (promoCodes.length == 0)
    {
        let tr = document.createElement('tr')
        promoCodesTable.appendChild(tr)

        let a = document.createElement('th')
        a.scope = 'row'
        tr.appendChild(a)

        let b = document.createElement('th')
        b.scope = 'row'
        b.style = 'text-align: center'
        b.innerText = 'Empty...'
        tr.appendChild(b)

        let c = document.createElement('th')
        c.scope = 'row'
        c.style = 'text-align: right'
        tr.appendChild(c)
    }
}

function saveTicketVault()
{
    let a = validateTicketVaultTitle()
    let b = validateTicketVaultPrice()
    let c = validateTicketVaultTotal()
    let d = validateTicketVaultLeft()
    
    if (!a || !b || !c || !d)
        return

    let ticketVault = {
        eventId: parseInt(document.getElementById('event-id').value),
        id: parseInt(params.get('id')),
        title: document.getElementById('ticket-vault-title').value,
        price: parseFloat(document.getElementById('ticket-vault-price').value),
        totalTickets: parseInt(document.getElementById('ticket-vault-total').value),
        ticketsLeft: parseInt(document.getElementById('ticket-vault-left').value)
    }

    console.log(JSON.stringify(ticketVault))
    
    fetch(ApiUri + TicketVaultsUri + '/' + ticketVault.id,
        {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify(ticketVault)
        })
        .then(async response => {
            if (response.ok)
            {
                document.location.replace('/events/edit.html?id=' + ticketVault.eventId)
            }
            else
            {
                _renderUpdateTicketVaultError(await response.text())
            }
        })
        .catch(reason => console.error(reason))
}

function _renderUpdateTicketVaultError(message)
{
    let element = document.getElementById('create-ticket-vault-error')
    if (element)
        element.value = message
    else
        console.error(message)
}

function validatePromoCodeCode()
{
    let element = document.getElementById('promo-code-code')
    let value = element?.value ?? ''
    
    if (value.trim().length < 3)
    {
        element.classList.remove('is-valid')
        element.classList.add('is-invalid')
        return false
    }

    element.classList.remove('is-invalid')
    element.classList.add('is-valid')
    return true
}

function validatePromoCodeDiscount()
{
    let inputElement = document.getElementById("promo-code-discount")
    let errorElement = document.getElementById('promo-code-discount-error')
    let wrapperElement = document.getElementById('promo-code-discount-wrapper')
    if (!inputElement || !errorElement || !wrapperElement)
    {
        console.error('Cannot access #promo-code-discount or #promo-code-discount-error or #promo-code-discount-wrapper element')
        return false
    }
    let value = inputElement.value

    // validation
    try {

        let discount = parseFloat(value)
        if (isNaN(discount))
            throw 'No number provided'
        
        if (discount <= 0 || discount > 100)
            throw 'Discount must be withing (0; 100]'

        wrapperElement.classList.remove('is-invalid')
        wrapperElement.classList.add('is-valid')
        inputElement.classList.remove('is-invalid')
        inputElement.classList.add('is-valid')

    }
    catch (s) {
        errorElement.innerText = s
        wrapperElement.classList.remove('is-valid')
        wrapperElement.classList.add('is-invalid')
        inputElement.classList.remove('is-valid')
        inputElement.classList.add('is-invalid')
        return false
    }
    return true
}

function addPromoCode()
{
    let a = validatePromoCodeCode()
    let b = validatePromoCodeDiscount()
    if (!a || !b)
        return
    
    let discount = {
        ticketVaultId: parseInt(params.get('id')),
        code: document.getElementById('promo-code-code').value,
        discount: parseFloat(document.getElementById('promo-code-discount').value) / 100
    } 
    
    console.log(discount)
    
    fetch(ApiUri + PromoCodesUri, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify(discount)
    })
        .then(async response => {
            if (response.ok)
                document.location.reload()

            _renderAddPromoCodeError(await response.json())
        })
        .catch(reason => {
            console.error(reason.message)
        })
}

function _renderAddPromoCodeError(message)
{
    let element = document.getElementById('create-promo-code-error')
    if (element)
        element.innerText = message
    else
        console.error(message) 
}

function deletePromoCode(id, reload=true)
{
    if (!confirm('You really want to delete it?'))
        return
    fetch(ApiUri + PromoCodesUri + '/' + id, {
        method: 'DElETE'
    })
        .then(async response => {
            if (response.ok) {
                document.location.reload()
            } else {
                console.error(await response.text())
            }
        })
}