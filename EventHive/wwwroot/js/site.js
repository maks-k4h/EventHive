
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


function _renderTicketVaults(grid, collection)
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
            title.textContent = ticketVault.title
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
            
            if (ticketVault.ticketsLeft > 0) {
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