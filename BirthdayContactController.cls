public with sharing class BirthdayContactController {
    
    @AuraEnabled(cacheable=true)
    public static List<Contact> getTodayBirthdays() {
        try {
            Date today = Date.today();
            Integer todayMonth = today.month();
            Integer todayDay = today.day();
            
            List<Contact> allContacts = [
                SELECT Id, Name, FirstName, LastName, Title, Email, 
                       Phone, Birthdate, Account.Name, PhotoUrl
                FROM Contact
                WHERE Birthdate != NULL
                ORDER BY Name ASC
            ];
            
            List<Contact> result = new List<Contact>();
            for (Contact c : allContacts) {
                if (c.Birthdate.month() == todayMonth && c.Birthdate.day() == todayDay) {
                    result.add(c);
                }
            }
            return result;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}