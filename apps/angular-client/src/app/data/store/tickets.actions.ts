import { Mode } from '@acme/shared-models';


export class Add {
    static readonly type = '[Ticket] Add';
    constructor(public description: string) {}
}

export class Assign {
    static readonly type = "[Ticket] Assign";
    constructor(public ticketId: number, public userId: number) {}
}

export class Complete {
    static readonly type = "[Ticket] Complete";
    constructor(public ticketId: number) {}
}

export class GetUsers {
    static readonly type = "[Users] Get Users"
}

export class GetUser {
    static readonly type = "[Users] Get User"
    constructor(public userId: number) {}
}

export class GetTickets {
    static readonly type = "[Ticket] Get Tickets"
}

export class GetTicket {
    static readonly type = "[Ticket] Get Ticket"
    constructor(public ticketId: number) {}
}

export class SortTickets {
    static readonly type = "[Tickets] Sort Tickets"
    constructor(public sortBy: 'completed' | 'not-completed' | 'none') {}
}

export class ChangeMode {
    static readonly type = "[Tickets] Change Mode"
    constructor(public mode: Mode) {}
}
