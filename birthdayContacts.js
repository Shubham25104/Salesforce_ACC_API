import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { open, execute } from 'lightning/accApi';
import getTodayBirthdays from '@salesforce/apex/BirthdayContactController.getTodayBirthdays';

const AGENT_ID = '0Xxg5000000wuxtCAA';

export default class BirthdayContacts extends LightningElement {

    @track contacts = [];
    @track isLoading = true;
    @track error = '';
    _wiredResult;

    @wire(getTodayBirthdays)
    wiredBirthdays(result) {
        this._wiredResult = result;
        this.isLoading = false;

        if (result.data) {
            this.error = '';
            this.contacts = result.data.map(c => ({
                ...c,
                AccountName: c.Account ? c.Account.Name : '',
                birthdateFormatted: c.Birthdate
                    ? new Date(c.Birthdate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                    : ''
            }));
        } else if (result.error) {
            this.contacts = [];
            this.error = result.error.body ? result.error.body.message : 'Error loading data.';
        }
    }

    get hasContacts() {
        return this.contacts && this.contacts.length > 0;
    }

    get isEmpty() {
        return !this.isLoading && !this.error && this.contacts.length === 0;
    }

    async handleWish(event) {
        const contactId = event.currentTarget.dataset.id;
        const contactName = event.currentTarget.dataset.name;

        try {
            await open(AGENT_ID);
            await execute('Generate a birthday wish for contactId: ' + contactId, '0Xxg5000000wuxtCAA');

            this.dispatchEvent(new ShowToastEvent({
                title: 'Agent Opened',
                message: 'Generating birthday wish for ' + contactName,
                variant: 'success'
            }));

        } catch (err) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: err.message || 'Unable to open Agent',
                variant: 'error'
            }));
        }
    }
}