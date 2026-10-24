package in.edu.ssn.hostel.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import in.edu.ssn.hostel.config.MessagingConfig;
import in.edu.ssn.hostel.model.Student;

/** Publishes preference submissions; persistence is performed by the consumer. */
@Service
public class PreferenceSubmissionService {

    @Autowired(required = false)
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private studentService students;

    @Value("${app.messaging.enabled:false}")
    private boolean messagingEnabled;

    public void submit(Student student) {
        if (messagingEnabled && rabbitTemplate != null) {
            rabbitTemplate.convertAndSend(MessagingConfig.PREFERENCE_QUEUE, student);
            return;
        }

        // Keeps non-Docker local runs and existing tests usable when messaging is disabled.
        students.addStudent(student);
    }
}
