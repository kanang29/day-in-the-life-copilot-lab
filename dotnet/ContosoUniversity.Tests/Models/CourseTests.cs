using ContosoUniversity.Core.Models;
using Xunit;

namespace ContosoUniversity.Tests.Models
{
    public class CourseTests
    {
        [Fact]
        public void MaxEnrollment_DefaultValue_Is30()
        {
            var course = new Course();

            Assert.Equal(30, course.MaxEnrollment);
        }
    }
}
