package in.edu.ssn.hostel.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import in.edu.ssn.hostel.config.MessagingConfig;
import in.edu.ssn.hostel.model.Student;

/** Consumes queued submissions and writes them to PostgreSQL. */
@Component
@ConditionalOnProperty(name = "app.messaging.enabled", havingValue = "true")
public class PreferenceSubmissionConsumer {

    private final studentService students;

    public PreferenceSubmissionConsumer(studentService students) {
        this.students = students;
    }

    @RabbitListener(queues = MessagingConfig.PREFERENCE_QUEUE)
    public void consume(Student student) {
        students.addStudent(student);
    }
}
