namespace EventHive.Models;

public record Constants
{
    public record Events
    {
        public static TimeSpan EventDateFromNow = TimeSpan.FromDays(365);
    }
}